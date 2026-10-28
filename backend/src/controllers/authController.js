import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import {
  generateAccountNumber,
  generateCardDetails,
  generateReferenceId,
} from '../utils/accountNumberGenerator.js';
import { seedDatabase } from '../utils/seedData.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_bank_jwt_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new customer and automatically provision primary checking account
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, initialDeposit } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'customer',
    });

    // Automatically create a primary checking account
    const { cardNumber, cardExpiry, cardCvv } = generateCardDetails();
    const depositAmount = initialDeposit && Number(initialDeposit) > 0 ? Number(initialDeposit) : 500; // default $500 welcome funding

    const account = await Account.create({
      user: user._id,
      accountNumber: generateAccountNumber(),
      accountType: 'checking',
      balance: depositAmount,
      cardNumber,
      cardExpiry,
      cardCvv,
    });

    // Record welcome deposit transaction
    if (depositAmount > 0) {
      await Transaction.create({
        referenceId: generateReferenceId('DEP'),
        type: 'DEPOSIT',
        amount: depositAmount,
        currency: 'USD',
        recipientAccount: account._id,
        recipientUser: user._id,
        recipientAccountNumber: account.accountNumber,
        description: 'Initial Account Opening Deposit',
        category: 'Cash Deposit',
        status: 'COMPLETED',
        balanceAfter: depositAmount,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        account: {
          id: account._id,
          accountNumber: account.accountNumber,
          balance: account.balance,
          accountType: account.accountType,
          cardNumber: account.cardNumber,
          cardExpiry: account.cardExpiry,
          cardCvv: account.cardCvv,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact bank administration.',
      });
    }

    // Find user's accounts
    const accounts = await Account.find({ user: user._id });

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        accounts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile & accounts
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const accounts = await Account.find({ user: user._id });

    res.json({
      success: true,
      data: {
        user,
        accounts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile',
    });
  }
};

// @desc    Seed or reset demo database with progress steps
// @route   POST /api/auth/seed
// @access  Public
export const triggerDatabaseSeed = async (req, res) => {
  try {
    const steps = [];
    const result = await seedDatabase(true, (percent, message) => {
      steps.push({ percent, message, timestamp: new Date().toISOString() });
    });

    res.json({
      success: true,
      message: 'Demo database seeded successfully with full progress tracking!',
      steps,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed database',
    });
  }
};
