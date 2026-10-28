import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { generateReferenceId } from '../utils/accountNumberGenerator.js';

// @desc    Deposit money into an account
// @route   POST /api/transactions/deposit
// @access  Private
export const depositMoney = async (req, res) => {
  try {
    const { accountId, amount, description = 'Direct Deposit', category = 'Cash Deposit' } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Deposit amount must be a positive number',
      });
    }

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found or access unauthorized',
      });
    }

    if (account.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Account is currently ${account.status}. Deposits not permitted.`,
      });
    }

    // Atomically increment account balance
    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      { $inc: { balance: numAmount } },
      { new: true }
    );

    const transaction = await Transaction.create({
      referenceId: generateReferenceId('DEP'),
      type: 'DEPOSIT',
      amount: numAmount,
      currency: account.currency,
      recipientAccount: account._id,
      recipientUser: req.user._id,
      recipientAccountNumber: account.accountNumber,
      description,
      category,
      status: 'COMPLETED',
      balanceAfter: updatedAccount.balance,
    });

    res.status(200).json({
      success: true,
      message: `Successfully deposited $${numAmount.toFixed(2)}`,
      data: {
        account: updatedAccount,
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Deposit failed',
    });
  }
};

// @desc    Withdraw money from an account
// @route   POST /api/transactions/withdraw
// @access  Private
export const withdrawMoney = async (req, res) => {
  try {
    const { accountId, amount, description = 'ATM Withdrawal', category = 'ATM Withdrawal' } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal amount must be a positive number',
      });
    }

    // Atomically check balance and deduct in one step to prevent race conditions
    const updatedAccount = await Account.findOneAndUpdate(
      {
        _id: accountId,
        user: req.user._id,
        balance: { $gte: numAmount },
        status: 'active',
      },
      { $inc: { balance: -numAmount } },
      { new: true }
    );

    if (!updatedAccount) {
      // Check if account exists to give a precise error message
      const checkAccount = await Account.findOne({ _id: accountId, user: req.user._id });
      if (!checkAccount) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }
      if (checkAccount.status !== 'active') {
        return res.status(400).json({ success: false, message: `Account is ${checkAccount.status}` });
      }
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Current balance is $${checkAccount.balance.toFixed(2)}`,
      });
    }

    const transaction = await Transaction.create({
      referenceId: generateReferenceId('WTH'),
      type: 'WITHDRAWAL',
      amount: numAmount,
      currency: updatedAccount.currency,
      senderAccount: updatedAccount._id,
      senderUser: req.user._id,
      senderAccountNumber: updatedAccount.accountNumber,
      description,
      category,
      status: 'COMPLETED',
      balanceAfter: updatedAccount.balance,
    });

    res.status(200).json({
      success: true,
      message: `Successfully withdrew $${numAmount.toFixed(2)}`,
      data: {
        account: updatedAccount,
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Withdrawal failed',
    });
  }
};

// @desc    Transfer money between accounts
// @route   POST /api/transactions/transfer
// @access  Private
export const transferMoney = async (req, res) => {
  try {
    const {
      fromAccountId,
      toAccountNumber,
      amount,
      description = 'Bank Transfer',
      category = 'Transfer',
    } = req.body;

    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transfer amount must be greater than zero',
      });
    }

    // 1. Locate and validate sender account
    const senderAccount = await Account.findOne({
      _id: fromAccountId,
      user: req.user._id,
    });

    if (!senderAccount) {
      return res.status(404).json({
        success: false,
        message: 'Sender account not found or unauthorized',
      });
    }

    if (senderAccount.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Sender account is currently ${senderAccount.status}`,
      });
    }

    // Prevent transfer to same account
    if (senderAccount.accountNumber === toAccountNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer funds to the same account',
      });
    }

    // 2. Locate recipient account
    const recipientAccount = await Account.findOne({
      accountNumber: toAccountNumber.trim(),
    }).populate('user', 'name email');

    if (!recipientAccount) {
      return res.status(404).json({
        success: false,
        message: 'Recipient account number does not exist',
      });
    }

    if (recipientAccount.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Recipient account is not active and cannot receive transfers',
      });
    }

    // 3. Daily transfer limit check
    if (numAmount > (senderAccount.dailyTransferLimit || 5000)) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds daily transfer limit of $${senderAccount.dailyTransferLimit}`,
      });
    }

    // 4. Atomic debit from sender with balance check
    const updatedSender = await Account.findOneAndUpdate(
      {
        _id: senderAccount._id,
        balance: { $gte: numAmount },
        status: 'active',
      },
      { $inc: { balance: -numAmount } },
      { new: true }
    );

    if (!updatedSender) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Available balance: $${senderAccount.balance.toFixed(2)}`,
      });
    }

    // 5. Atomic credit to recipient
    const updatedRecipient = await Account.findByIdAndUpdate(
      recipientAccount._id,
      { $inc: { balance: numAmount } },
      { new: true }
    );

    // 6. Record transaction ledger
    const referenceId = generateReferenceId('TRF');
    const transaction = await Transaction.create({
      referenceId,
      type: 'TRANSFER',
      amount: numAmount,
      currency: senderAccount.currency,
      senderAccount: senderAccount._id,
      senderUser: req.user._id,
      senderAccountNumber: senderAccount.accountNumber,
      recipientAccount: recipientAccount._id,
      recipientUser: recipientAccount.user._id,
      recipientAccountNumber: recipientAccount.accountNumber,
      description: `${description} (To ${recipientAccount.user.name})`,
      category,
      status: 'COMPLETED',
      balanceAfter: updatedSender.balance,
    });

    res.status(200).json({
      success: true,
      message: `Successfully transferred $${numAmount.toFixed(2)} to ${recipientAccount.user.name}`,
      data: {
        referenceId,
        senderAccount: updatedSender,
        recipient: {
          name: recipientAccount.user.name,
          accountNumber: recipientAccount.accountNumber,
        },
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Transfer failed',
    });
  }
};

// @desc    Get user's transaction history with filtering and pagination
// @route   GET /api/transactions/history
// @access  Private
export const getTransactionHistory = async (req, res) => {
  try {
    const { accountId, type, search, page = 1, limit = 20 } = req.query;

    // Find all accounts owned by user
    const userAccounts = await Account.find({ user: req.user._id }).select('_id');
    const accountIds = userAccounts.map((acc) => acc._id);

    const query = {
      $or: [
        { senderAccount: { $in: accountIds } },
        { recipientAccount: { $in: accountIds } },
      ],
    };

    if (accountId) {
      query.$or = [{ senderAccount: accountId }, { recipientAccount: accountId }];
    }

    if (type && ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'].includes(type.toUpperCase())) {
      query.type = type.toUpperCase();
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { referenceId: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { senderAccountNumber: { $regex: search, $options: 'i' } },
            { recipientAccountNumber: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('senderUser', 'name email')
        .populate('recipientUser', 'name email'),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction history',
    });
  }
};

// @desc    Get aggregated analytics (income, expenses, spending categories)
// @route   GET /api/transactions/analytics
// @access  Private
export const getTransactionAnalytics = async (req, res) => {
  try {
    const userAccounts = await Account.find({ user: req.user._id }).select('_id');
    const accountIds = userAccounts.map((acc) => acc._id);

    const transactions = await Transaction.find({
      $or: [
        { senderAccount: { $in: accountIds } },
        { recipientAccount: { $in: accountIds } },
      ],
      status: 'COMPLETED',
    }).sort({ createdAt: -1 });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach((tx) => {
      const isSender = accountIds.some((id) => id.toString() === tx.senderAccount?.toString());
      const isRecipient = accountIds.some((id) => id.toString() === tx.recipientAccount?.toString());

      if (tx.type === 'DEPOSIT' && isRecipient) {
        totalIncome += tx.amount;
      } else if (tx.type === 'WITHDRAWAL' && isSender) {
        totalExpense += tx.amount;
        categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
      } else if (tx.type === 'TRANSFER') {
        if (isSender && !isRecipient) {
          totalExpense += tx.amount;
          categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
        } else if (isRecipient && !isSender) {
          totalIncome += tx.amount;
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        categoryBreakdown,
        recentCount: transactions.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction analytics',
    });
  }
};
