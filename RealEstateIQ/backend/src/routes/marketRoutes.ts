import { Router } from 'express';
import { getMarketAnalytics, getRecommendations } from '../controllers/marketController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/analytics', getMarketAnalytics);
router.get('/recommendations', requireAuth, getRecommendations);

export default router;
