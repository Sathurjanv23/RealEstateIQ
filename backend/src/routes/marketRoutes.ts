import { Router } from 'express';
import { getMarketAnalytics, getRecommendations, getModelInfo } from '../controllers/marketController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/analytics', getMarketAnalytics);
router.get('/recommendations', requireAuth, getRecommendations);
router.get('/model-info', getModelInfo);

export default router;
