import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createOffer,
  getMyOffers,
  getReceivedOffers,
  updateOfferStatus,
} from '../controllers/offerController';

const router = Router();

router.post('/', requireAuth, createOffer);
router.get('/my', requireAuth, getMyOffers);
router.get('/received', requireAuth, getReceivedOffers);
router.patch('/:id/status', requireAuth, updateOfferStatus);

export default router;
