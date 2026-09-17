import { Router } from 'express';
import { body } from 'express-validator';
import {
  createPrediction,
  getPredictionHistory,
  getPrediction,
} from '../controllers/predictionController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/',
  requireAuth,
  [
    body('area').isFloat({ min: 1, max: 50000 }).withMessage('Area must be 1–50000 sqft.'),
    body('bedrooms').isInt({ min: 1, max: 20 }).withMessage('Bedrooms must be 1–20.'),
    body('bathrooms').isInt({ min: 1, max: 20 }).withMessage('Bathrooms must be 1–20.'),
    body('location')
      .isIn(['Colombo', 'Kandy', 'Galle', 'Negombo'])
      .withMessage('Location must be Colombo, Kandy, Galle, or Negombo.'),
    body('house_age').isInt({ min: 0, max: 150 }).withMessage('House age must be 0–150.'),
    body('parking').isInt({ min: 0, max: 20 }).withMessage('Parking must be 0–20.'),
    body('propertyId').optional().isMongoId().withMessage('Invalid property ID.'),
  ],
  validate,
  createPrediction
);

router.get('/history', requireAuth, getPredictionHistory);
router.get('/:id', requireAuth, getPrediction);

export default router;
