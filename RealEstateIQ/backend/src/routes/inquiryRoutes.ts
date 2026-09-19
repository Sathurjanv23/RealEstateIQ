import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from '../controllers/inquiryController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public: Submit a viewing inquiry
router.post('/', createInquiry);

// Protected: View, update and delete inquiries (agents / admin)
router.get('/', requireAuth, getInquiries);
router.patch('/:id/status', requireAuth, updateInquiryStatus);
router.delete('/:id', requireAuth, deleteInquiry);

export default router;
