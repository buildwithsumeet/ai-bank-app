import express from 'express';
import {
  depositMoney,
  withdrawMoney,
  transferMoney,
  getTransactionHistory,
  getTransactionAnalytics,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All transaction operations require authenticated session

router.post('/deposit', depositMoney);
router.post('/withdraw', withdrawMoney);
router.post('/transfer', transferMoney);
router.get('/history', getTransactionHistory);
router.get('/analytics', getTransactionAnalytics);

export default router;
