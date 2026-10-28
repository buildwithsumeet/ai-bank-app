import express from 'express';
import {
  getMyAccounts,
  getAccountById,
  createAccount,
  lookupAccount,
} from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All account routes require authentication

router.route('/').get(getMyAccounts).post(createAccount);
router.get('/lookup/:accountNumber', lookupAccount);
router.get('/:id', getAccountById);

export default router;
