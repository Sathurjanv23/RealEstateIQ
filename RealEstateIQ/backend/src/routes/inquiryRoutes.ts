import { Router } from 'express';
import { createInquiry, getInquiries } from '../controllers/inquiryController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public: Submit a viewing inquiry
router.post('/', createInquiry);

// Protected: View inquiries (agents / admin)
router.get('/', requireAuth, getInquiries);

export default router;
