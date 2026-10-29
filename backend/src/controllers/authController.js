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
import {
  generateTokenPair,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/tokenManager.js';
import {
  cacheGet,
  cacheSet,
  blacklistToken,
  revokeRefreshToken,
  verifyStoredRefreshToken,
} from '../utils/cacheManager.js';

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

    // Generate Dual-Token Pair (Access Token + Refresh Token)
    const tokens = await generateTokenPair(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: tokens.token,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
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

// @desc    Authenticate user & get token pair (Access + Refresh Token)
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

    // Generate Dual-Token Pair
    const tokens = await generateTokenPair(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: tokens.token,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
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

// @desc    Refresh Access Token using Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required in request body',
      });
    }

    // 1. Verify token signature
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    // 2. Validate token presence in Redis (if Redis active)
    const storedUserId = await verifyStoredRefreshToken(refreshToken);
    if (storedUserId && storedUserId !== decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token mismatch or revoked.',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User no longer active or exists',
      });
    }

    // 3. Rotate tokens: revoke old refresh token and issue new pair
    await revokeRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    res.json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        token: newAccessToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Token refresh failed',
    });
  }
};

// @desc    Logout user & revoke tokens in Redis blacklist
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    const token = req.token;
    const { refreshToken } = req.body;

    // Blacklist access token in Redis (15 mins TTL)
    if (token) {
      await blacklistToken(token, 15 * 60);
    }

    // Revoke refresh token in Redis
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Successfully logged out and session revoked',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Logout failed',
    });
  }
};

// @desc    Get current user profile & accounts with Redis In-Memory Caching
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const cacheKey = `user:profile:${req.user._id}`;

    // 1. Check Redis cache first
    const cachedProfile = await cacheGet(cacheKey);
    if (cachedProfile) {
      return res.json({
        success: true,
        cached: true,
        data: cachedProfile,
      });
    }

    // 2. Cache miss: fetch from MongoDB
    const user = await User.findById(req.user._id);
    const accounts = await Account.find({ user: user._id });

    const profileData = {
      user,
      accounts,
    };

    // 3. Save to Redis with 10-minute TTL (600 seconds)
    await cacheSet(cacheKey, profileData, 600);

    res.json({
      success: true,
      cached: false,
      data: profileData,
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

