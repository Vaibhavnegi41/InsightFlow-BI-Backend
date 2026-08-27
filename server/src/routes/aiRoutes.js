import { Router } from 'express';
import { askQuestion, checkStatus } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/ask', authMiddleware, askQuestion);
router.get('/status', authMiddleware, checkStatus);

export default router;
