import Account from '../models/Account.js';
import {
  generateAccountNumber,
  generateCardDetails,
} from '../utils/accountNumberGenerator.js';

// @desc    Get all accounts for authenticated user
// @route   GET /api/accounts
// @access  Private
export const getMyAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch accounts',
    });
  }
};

// @desc    Get account by ID
// @route   GET /api/accounts/:id
// @access  Private
export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate('user', 'name email');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Ensure the account belongs to user or user is admin
    if (account.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this account',
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve account details',
    });
  }
};

// @desc    Create secondary account (Savings / Checking / Investment)
// @route   POST /api/accounts
// @access  Private
export const createAccount = async (req, res) => {
  try {
    const { accountType = 'savings', currency = 'USD' } = req.body;
    const { cardNumber, cardExpiry, cardCvv } = generateCardDetails();

    const account = await Account.create({
      user: req.user._id,
      accountNumber: generateAccountNumber(),
      accountType,
      currency,
      balance: 0,
      cardNumber,
      cardExpiry,
      cardCvv,
    });

    res.status(201).json({
      success: true,
      message: `${accountType.toUpperCase()} account opened successfully`,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Could not create new account',
    });
  }
};

// @desc    Lookup recipient account by account number (for verification before sending money)
// @route   GET /api/accounts/lookup/:accountNumber
// @access  Private
export const lookupAccount = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const account = await Account.findOne({ accountNumber, status: 'active' }).populate('user', 'name email');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Active recipient account not found. Please verify the account number.',
      });
    }

    res.json({
      success: true,
      data: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        recipientName: account.user.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Account lookup failed',
    });
  }
};
