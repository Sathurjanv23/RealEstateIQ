import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPackages,
  createCheckout,
  handlePayHereNotify,
  getPaymentHistory,
} from '../controllers/paymentController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Publicly view packages and pricing
router.get('/packages', getPackages);

// Create checkout session (Auth required)
router.post(
  '/checkout',
  requireAuth,
  [
    body('packageId').isString().notEmpty().withMessage('Package ID is required.'),
    body('propertyId').optional().isString(),
    body('phone').optional().isString(),
  ],
  validate,
  createCheckout
);

// PayHere Server-to-server IPN Webhook (Public, signature-verified)
router.post('/payhere-notify', handlePayHereNotify);

// User invoice / payment history
router.get('/history', requireAuth, getPaymentHistory);

export default router;
