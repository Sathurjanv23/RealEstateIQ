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

const VALID_LOCATIONS = [
  // Western Province
  'Colombo', 'Gampaha', 'Kalutara',
  // Central Province
  'Kandy', 'Matale', 'Nuwara Eliya',
  // Southern Province
  'Galle', 'Matara', 'Hambantota',
  // Northern Province
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullativu',
  // Eastern Province
  'Trincomalee', 'Batticaloa', 'Ampara',
  // North Western Province
  'Kurunegala', 'Puttalam',
  // North Central Province
  'Anuradhapura', 'Polonnaruwa',
  // Uva Province
  'Badulla', 'Monaragala',
  // Sabaragamuwa Province
  'Ratnapura', 'Kegalle',
];

router.post(
  '/',
  requireAuth,
  [
    body('area').isFloat({ min: 1, max: 50000 }).withMessage('Area must be 1–50000 sqft.'),
    body('bedrooms').isInt({ min: 1, max: 20 }).withMessage('Bedrooms must be 1–20.'),
    body('bathrooms').isInt({ min: 1, max: 20 }).withMessage('Bathrooms must be 1–20.'),
    body('location')
      .isIn(VALID_LOCATIONS)
      .withMessage('Invalid Sri Lanka district. Please select a valid district.'),
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
