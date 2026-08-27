import { Router } from 'express';
import { listAlerts, createAlert, patchAlert, removeAlert, listAlertHistory, triggerEvaluateAlerts } from '../controllers/alertController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, listAlerts);
router.post('/', authMiddleware, createAlert);
router.patch('/:id', authMiddleware, patchAlert);
router.delete('/:id', authMiddleware, removeAlert);
router.get('/history', authMiddleware, listAlertHistory);
router.post('/evaluate', authMiddleware, triggerEvaluateAlerts);

export default router;
