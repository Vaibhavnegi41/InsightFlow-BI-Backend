import { Router } from 'express';
import { fetchInsights, triggerGenerateInsights } from '../controllers/insightController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, fetchInsights);
router.post('/generate', authMiddleware, triggerGenerateInsights);

export default router;
