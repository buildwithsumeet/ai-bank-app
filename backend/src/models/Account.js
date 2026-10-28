import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'checking', 'investment'],
      default: 'checking',
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Account balance cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['active', 'frozen', 'closed'],
      default: 'active',
    },
    cardNumber: {
      type: String,
      default: '',
    },
    cardExpiry: {
      type: String,
      default: '',
    },
    cardCvv: {
      type: String,
      default: '',
    },
    dailyTransferLimit: {
      type: Number,
      default: 5000,
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model('Account', accountSchema);
export default Account;
