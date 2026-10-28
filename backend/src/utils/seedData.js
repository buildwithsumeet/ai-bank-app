import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import {
  generateAccountNumber,
  generateCardDetails,
  generateReferenceId,
} from './accountNumberGenerator.js';

dotenv.config();

/**
 * Seeds the database with demo users, accounts, and realistic transaction data.
 * Reports progress through onProgress callback or console.
 */
export const seedDatabase = async (force = false, onProgress = null) => {
  const logProgress = (percent, message) => {
    console.log(`[🌱 DB Seed Progress: ${percent}%] ${message}`);
    if (onProgress && typeof onProgress === 'function') {
      onProgress(percent, message);
    }
  };

  try {
    logProgress(5, 'Inspecting User database...');
    const userCount = await User.countDocuments();

    // If users already exist and not forced, skip
    if (userCount > 0 && !force) {
      logProgress(100, `Database already contains ${userCount} users. Auto-seed skipped.`);
      return { skipped: true, userCount };
    }

    logProgress(20, 'Resetting bank tables and accounts...');
    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});

    logProgress(40, 'Creating demo users (Admin, Alice, Bob, Charlie)...');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Bank Administrator',
      email: 'admin@apexbank.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
    });

    // 2. Create Customers
    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 014-9921',
    });

    const bob = await User.create({
      name: 'Bob Martinez',
      email: 'bob@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 017-3829',
    });

    const charlie = await User.create({
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 012-4411',
    });

    logProgress(65, 'Provisioning bank accounts and virtual debit cards...');

    const aliceCard = generateCardDetails();
    const aliceAccount = await Account.create({
      user: alice._id,
      accountNumber: '1088492015',
      accountType: 'checking',
      balance: 14250.75,
      cardNumber: aliceCard.cardNumber,
      cardExpiry: aliceCard.cardExpiry,
      cardCvv: aliceCard.cardCvv,
    });

    const aliceSavings = await Account.create({
      user: alice._id,
      accountNumber: '1099238471',
      accountType: 'savings',
      balance: 38500.0,
      cardNumber: generateCardDetails().cardNumber,
      cardExpiry: generateCardDetails().cardExpiry,
      cardCvv: generateCardDetails().cardCvv,
    });

    const bobCard = generateCardDetails();
    const bobAccount = await Account.create({
      user: bob._id,
      accountNumber: '1077391823',
      accountType: 'checking',
      balance: 8640.5,
      cardNumber: bobCard.cardNumber,
      cardExpiry: bobCard.cardExpiry,
      cardCvv: bobCard.cardCvv,
    });

    const charlieCard = generateCardDetails();
    const charlieAccount = await Account.create({
      user: charlie._id,
      accountNumber: '1066293842',
      accountType: 'checking',
      balance: 5120.0,
      cardNumber: charlieCard.cardNumber,
      cardExpiry: charlieCard.cardExpiry,
      cardCvv: charlieCard.cardCvv,
    });

    logProgress(85, 'Recording transaction history ledger...');

    await Transaction.create([
      {
        referenceId: generateReferenceId('DEP'),
        type: 'DEPOSIT',
        amount: 10000,
        currency: 'USD',
        recipientAccount: aliceAccount._id,
        recipientUser: alice._id,
        recipientAccountNumber: aliceAccount.accountNumber,
        description: 'Bi-weekly Direct Deposit (Acme Corp)',
        category: 'Salary',
        status: 'COMPLETED',
        balanceAfter: 15500.75,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        referenceId: generateReferenceId('TRF'),
        type: 'TRANSFER',
        amount: 1250,
        currency: 'USD',
        senderAccount: aliceAccount._id,
        senderUser: alice._id,
        senderAccountNumber: aliceAccount.accountNumber,
        recipientAccount: bobAccount._id,
        recipientUser: bob._id,
        recipientAccountNumber: bobAccount.accountNumber,
        description: 'Apartment monthly share transfer (To Bob Martinez)',
        category: 'Transfer',
        status: 'COMPLETED',
        balanceAfter: 14250.75,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        referenceId: generateReferenceId('WTH'),
        type: 'WITHDRAWAL',
        amount: 200,
        currency: 'USD',
        senderAccount: bobAccount._id,
        senderUser: bob._id,
        senderAccountNumber: bobAccount.accountNumber,
        description: 'ATM Cash Withdrawal - Downtown Branch',
        category: 'ATM Withdrawal',
        status: 'COMPLETED',
        balanceAfter: 8640.5,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        referenceId: generateReferenceId('DEP'),
        type: 'DEPOSIT',
        amount: 5120,
        currency: 'USD',
        recipientAccount: charlieAccount._id,
        recipientUser: charlie._id,
        recipientAccountNumber: charlieAccount.accountNumber,
        description: 'Consulting Project Wire Inflow',
        category: 'Salary',
        status: 'COMPLETED',
        balanceAfter: 5120.0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ]);

    logProgress(100, '✅ Database seed complete! Users, accounts & ledger ready.');

    return {
      success: true,
      seeded: true,
      users: 4,
      accounts: 4,
      transactions: 4,
    };
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// If run directly from CLI (e.g. `npm run seed`)
const isDirectRun = process.argv[1]?.endsWith('seedData.js');
if (isDirectRun) {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bankdb';
  mongoose.connect(mongoUri)
    .then(() => seedDatabase(true))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
