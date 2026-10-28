import express from 'express';
import {
  getSystemMetrics,
  getAllUsers,
  updateAccountStatus,
  getAllTransactions,
} from '../controllers/adminController.js';
import { protect, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require both authentication and admin role
router.use(protect, authorizeAdmin);

router.get('/metrics', getSystemMetrics);
router.get('/users', getAllUsers);
router.put('/accounts/:id/status', updateAccountStatus);
router.get('/transactions', getAllTransactions);

export default router;
