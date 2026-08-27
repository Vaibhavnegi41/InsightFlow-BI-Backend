import { Router } from 'express';
import { runQuery, fetchQueryHistory, handleSaveQuery, fetchSavedQueries, analyzeSql } from '../controllers/queryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/execute', authMiddleware, runQuery);
router.get('/history', authMiddleware, fetchQueryHistory);
router.post('/save', authMiddleware, handleSaveQuery);
router.get('/saved', authMiddleware, fetchSavedQueries);
router.post('/analyze', authMiddleware, analyzeSql);

export default router;
