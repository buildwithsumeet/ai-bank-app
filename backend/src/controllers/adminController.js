import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

// @desc    Get overall bank system statistics
// @route   GET /api/admin/metrics
// @access  Private/Admin
export const getSystemMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalAccounts = await Account.countDocuments();
    const activeAccounts = await Account.countDocuments({ status: 'active' });
    const totalTransactions = await Transaction.countDocuments();

    // Sum total bank reserves / deposits
    const balanceAggregation = await Account.aggregate([
      { $group: { _id: null, totalHoldings: { $sum: '$balance' } } },
    ]);
    const totalBankHoldings = balanceAggregation[0]?.totalHoldings || 0;

    // Sum total transaction volume
    const volumeAggregation = await Transaction.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, totalVolume: { $sum: '$amount' } } },
    ]);
    const totalTransactionVolume = volumeAggregation[0]?.totalVolume || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAccounts,
        activeAccounts,
        totalTransactions,
        totalBankHoldings,
        totalTransactionVolume,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin metrics',
    });
  }
};

// @desc    Get all users with their accounts
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const userIds = users.map((u) => u._id);
    const accounts = await Account.find({ user: { $in: userIds } });

    const usersWithAccounts = users.map((user) => {
      const userAccs = accounts.filter(
        (a) => a.user.toString() === user._id.toString()
      );
      return {
        ...user.toObject(),
        accounts: userAccs,
        totalBalance: userAccs.reduce((sum, a) => sum + a.balance, 0),
      };
    });

    res.json({
      success: true,
      count: users.length,
      data: usersWithAccounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user list',
    });
  }
};

// @desc    Update account status (active, frozen, closed)
// @route   PUT /api/admin/accounts/:id/status
// @access  Private/Admin
export const updateAccountStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'frozen', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, frozen, or closed',
      });
    }

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    res.json({
      success: true,
      message: `Account status updated to ${status}`,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update account status',
    });
  }
};

// @desc    Get all transactions across entire bank
// @route   GET /api/admin/transactions
// @access  Private/Admin
export const getAllTransactions = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderUser', 'name email')
        .populate('recipientUser', 'name email'),
      Transaction.countDocuments(),
    ]);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch global transactions',
    });
  }
};
