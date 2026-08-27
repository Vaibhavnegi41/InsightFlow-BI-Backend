import { Router } from 'express';
import { getKpis, getRevenueAnalytics, getProfitAnalytics, getProductAnalytics, getRegionalAnalytics } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/kpis', authMiddleware, getKpis);
router.get('/revenue', authMiddleware, getRevenueAnalytics);
router.get('/profit', authMiddleware, getProfitAnalytics);
router.get('/products', authMiddleware, getProductAnalytics);
router.get('/regions', authMiddleware, getRegionalAnalytics);

export default router;
