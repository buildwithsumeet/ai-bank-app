import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  triggerDatabaseSeed,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/seed', triggerDatabaseSeed);
router.get('/profile', protect, getUserProfile);

export default router;

