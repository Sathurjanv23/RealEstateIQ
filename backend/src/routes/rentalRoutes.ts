import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createRentalApplication,
  getMyApplications,
  getReceivedApplications,
  updateApplicationStatus,
} from '../controllers/rentalController';

const router = Router();

router.post('/apply', requireAuth, createRentalApplication);
router.get('/my-applications', requireAuth, getMyApplications);
router.get('/received', requireAuth, getReceivedApplications);
router.patch('/:id/status', requireAuth, updateApplicationStatus);

export default router;
