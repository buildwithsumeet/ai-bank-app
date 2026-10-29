import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { cacheGet, cacheSet } from '../utils/cacheManager.js';

// @desc    Get overall bank system statistics (Cached in Redis)
// @route   GET /api/admin/metrics
// @access  Private/Admin
export const getSystemMetrics = async (req, res) => {
  try {
    const cacheKey = 'admin:metrics';
    const cachedMetrics = await cacheGet(cacheKey);

    if (cachedMetrics) {
      return res.json({
        success: true,
        cached: true,
        data: cachedMetrics,
      });
    }

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

    const metricsData = {
      totalUsers,
      totalAccounts,
      activeAccounts,
      totalTransactions,
      totalBankHoldings,
      totalTransactionVolume,
    };

    // Cache in Redis for 5 minutes (300 seconds)
    await cacheSet(cacheKey, metricsData, 300);

    res.json({
      success: true,
      cached: false,
      data: metricsData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin metrics',
    });
  }
};

// @desc    Get all users with their accounts using MongoDB $lookup Aggregation
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const usersWithAccounts = await User.aggregate([
      { $sort: { createdAt: -1 } },
      { $project: { password: 0 } },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: 'user',
          as: 'accounts',
        },
      },
      {
        $addFields: {
          totalBalance: { $sum: '$accounts.balance' },
        },
      },
    ]);

    res.json({
      success: true,
      count: usersWithAccounts.length,
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
