import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { generateReferenceId } from '../utils/accountNumberGenerator.js';
import {
  cacheGet,
  cacheSet,
  invalidateUserCache,
  invalidateAdminCache,
} from '../utils/cacheManager.js';

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

    // Invalidate Redis caches
    await invalidateUserCache(req.user._id);
    await invalidateAdminCache();

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

    // Invalidate Redis caches
    await invalidateUserCache(req.user._id);
    await invalidateAdminCache();

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

    // Invalidate Redis caches for sender, recipient, and admin
    await invalidateUserCache(req.user._id);
    if (recipientAccount.user?._id) {
      await invalidateUserCache(recipientAccount.user._id);
    }
    await invalidateAdminCache();

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

// @desc    Get aggregated analytics (income, expenses, spending categories, trends) via MongoDB Aggregation Pipeline
// @route   GET /api/transactions/analytics
// @access  Private
export const getTransactionAnalytics = async (req, res) => {
  try {
    const cacheKey = `analytics:${req.user._id}`;

    // 1. Check Redis cache first
    const cachedAnalytics = await cacheGet(cacheKey);
    if (cachedAnalytics) {
      return res.json({
        success: true,
        cached: true,
        data: cachedAnalytics,
      });
    }

    const userAccounts = await Account.find({ user: req.user._id }).select('_id');
    const accountIds = userAccounts.map((acc) => acc._id);

    if (accountIds.length === 0) {
      const emptyResult = {
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        categoryBreakdown: {},
        categories: [],
        monthlyTrend: [],
        highValueAlerts: [],
        recentCount: 0,
      };
      return res.json({ success: true, cached: false, data: emptyResult });
    }

    // 2. Execute MongoDB Multi-Stage Aggregation Pipeline with $facet
    const aggregationResult = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { senderAccount: { $in: accountIds } },
            { recipientAccount: { $in: accountIds } },
          ],
          status: 'COMPLETED',
        },
      },
      {
        $facet: {
          // Facet A: Financial summary (Income, Expense, Net Savings, Counts)
          summary: [
            {
              $project: {
                amount: 1,
                type: 1,
                isIncome: {
                  $or: [
                    { $and: [{ $eq: ['$type', 'DEPOSIT'] }, { $in: ['$recipientAccount', accountIds] }] },
                    { $and: [{ $eq: ['$type', 'TRANSFER'] }, { $in: ['$recipientAccount', accountIds] }, { $not: { $in: ['$senderAccount', accountIds] } }] },
                  ],
                },
                isExpense: {
                  $or: [
                    { $and: [{ $eq: ['$type', 'WITHDRAWAL'] }, { $in: ['$senderAccount', accountIds] }] },
                    { $and: [{ $eq: ['$type', 'TRANSFER'] }, { $in: ['$senderAccount', accountIds] }, { $not: { $in: ['$recipientAccount', accountIds] } }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: { $cond: [{ $eq: ['$isIncome', true] }, '$amount', 0] },
                },
                totalExpense: {
                  $sum: { $cond: [{ $eq: ['$isExpense', true] }, '$amount', 0] },
                },
                count: { $sum: 1 },
              },
            },
          ],

          // Facet B: Category Spending Breakdown
          categoryBreakdown: [
            {
              $match: {
                $or: [
                  { type: 'WITHDRAWAL', senderAccount: { $in: accountIds } },
                  { type: 'TRANSFER', senderAccount: { $in: accountIds }, recipientAccount: { $nin: accountIds } },
                ],
              },
            },
            {
              $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { totalAmount: -1 } },
          ],

          // Facet C: Monthly Cashflow Trend
          monthlyTrend: [
            {
              $group: {
                _id: {
                  month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                },
                volume: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.month': -1 } },
            { $limit: 6 },
          ],

          // Facet D: High-Value Alert Transactions
          highValueAlerts: [
            { $match: { amount: { $gte: 1000 } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                referenceId: 1,
                type: 1,
                amount: 1,
                category: 1,
                description: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
    ]);

    const facet = aggregationResult[0] || {};
    const summaryData = facet.summary?.[0] || { totalIncome: 0, totalExpense: 0, count: 0 };
    const categoriesArray = facet.categoryBreakdown || [];

    // Map categories to object for backward compatibility with frontend charts
    const categoryBreakdownObj = {};
    categoriesArray.forEach((cat) => {
      categoryBreakdownObj[cat._id || 'Other'] = cat.totalAmount;
    });

    const analyticsData = {
      totalIncome: summaryData.totalIncome || 0,
      totalExpense: summaryData.totalExpense || 0,
      netSavings: (summaryData.totalIncome || 0) - (summaryData.totalExpense || 0),
      categoryBreakdown: categoryBreakdownObj,
      categories: categoriesArray,
      monthlyTrend: facet.monthlyTrend || [],
      highValueAlerts: facet.highValueAlerts || [],
      recentCount: summaryData.count || 0,
    };

    // 3. Cache in Redis for 15 minutes (900 seconds)
    await cacheSet(cacheKey, analyticsData, 900);

    res.json({
      success: true,
      cached: false,
      data: analyticsData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction analytics',
    });
  }
};

