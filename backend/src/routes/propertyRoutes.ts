import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  saveProperty,
  unsaveProperty,
  getSavedProperties,
  compareProperties,
  uploadPropertyImage,
  uploadMultiplePropertyImages,
  getUploadStatus,
} from '../controllers/propertyController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { ALL_SL_LOCATIONS } from '../utils/sriLankaLocations';

const router = Router();

const propertyValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters.'),
  body('propertyType')
    .isIn(['house', 'apartment', 'land', 'commercial', 'villa'])
    .withMessage('Invalid property type.'),
  body('location')
    .isIn(ALL_SL_LOCATIONS)
    .withMessage('Location must be a valid Sri Lankan district or city hub.'),
  body('area').isFloat({ min: 1 }).withMessage('Area must be a positive number.'),
  body('bedrooms').isInt({ min: 0, max: 50 }).withMessage('Bedrooms must be 0–50.'),
  body('bathrooms').isInt({ min: 0, max: 50 }).withMessage('Bathrooms must be 0–50.'),
  body('houseAge').isInt({ min: 0, max: 200 }).withMessage('House age must be 0–200.'),
  body('parking').optional().isInt({ min: 0 }).withMessage('Parking must be non-negative.'),
  body('askingPrice').optional().isFloat({ min: 0 }).withMessage('Asking price must be non-negative.'),
];

const propertyUpdateValidation = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters.'),
  body('propertyType')
    .optional()
    .isIn(['house', 'apartment', 'land', 'commercial', 'villa'])
    .withMessage('Invalid property type.'),
  body('location')
    .optional()
    .isIn(ALL_SL_LOCATIONS)
    .withMessage('Location must be a valid Sri Lankan district or city hub.'),
  body('area').optional().isFloat({ min: 1 }).withMessage('Area must be a positive number.'),
  body('bedrooms').optional().isInt({ min: 0, max: 50 }).withMessage('Bedrooms must be 0–50.'),
  body('bathrooms').optional().isInt({ min: 0, max: 50 }).withMessage('Bathrooms must be 0–50.'),
  body('houseAge').optional().isInt({ min: 0, max: 200 }).withMessage('House age must be 0–200.'),
  body('parking').optional().isInt({ min: 0 }).withMessage('Parking must be non-negative.'),
  body('askingPrice').optional().isFloat({ min: 0 }).withMessage('Asking price must be non-negative.'),
];

router.get('/', getProperties);
router.get('/upload-status', getUploadStatus);
router.get('/saved', requireAuth, getSavedProperties);
router.post('/compare', requireAuth, [
  body('ids').isArray({ min: 2, max: 5 }).withMessage('Provide 2–5 property IDs.'),
], validate, compareProperties);
router.post('/upload', requireAuth, upload.single('image'), uploadPropertyImage);
router.post('/upload-multiple', requireAuth, upload.array('images', 8), uploadMultiplePropertyImages);
router.get('/:id', getProperty);
router.post('/', requireAuth, propertyValidation, validate, createProperty);
router.put('/:id', requireAuth, propertyUpdateValidation, validate, updateProperty);
router.delete('/:id', requireAuth, deleteProperty);
router.post('/:id/save', requireAuth, saveProperty);
router.delete('/:id/save', requireAuth, unsaveProperty);

export default router;

