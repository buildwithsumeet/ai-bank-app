import express from 'express';
import { getAiStatus, chatWithAi } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All AI banking interactions require authenticated session

router.get('/status', getAiStatus);
router.post('/chat', chatWithAi);

export default router;
