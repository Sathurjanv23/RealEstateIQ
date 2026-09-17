import { Response, NextFunction } from 'express';
import { Prediction } from '../models/Prediction';
import { callMlPredict } from '../utils/mlClient';
import { audit } from '../utils/auditLogger';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// ── Create prediction ──────────────────────────────────────────────────────
export const createPrediction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { area, bedrooms, bathrooms, location, house_age, parking, propertyId } =
      req.body;

    // Call the Python ML service
    const mlResult = await callMlPredict({
      area,
      bedrooms,
      bathrooms,
      location,
      house_age,
      parking,
    });

    // Persist prediction to MongoDB
    const prediction = await Prediction.create({
      userId: req.user!._id,
      propertyId: propertyId || null,
      inputFeatures: { area, bedrooms, bathrooms, location, house_age, parking },
      predictedPrice: mlResult.predicted_price,
      pricePerSqft: mlResult.price_per_sqft,
      modelVersion: mlResult.model_version,
      algorithm: mlResult.algorithm,
      datasetVersion: mlResult.dataset_version,
      featureImportance: mlResult.feature_importance,
    });

    await audit({
      userId: req.user!._id.toString(),
      action: 'PREDICTION_CREATED',
      resource: 'predictions',
      resourceId: prediction._id.toString(),
      metadata: { location, area, predictedPrice: mlResult.predicted_price },
      ipAddress: req.ip as string | undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        prediction: {
          id: prediction._id,
          predictedPrice: prediction.predictedPrice,
          pricePerSqft: prediction.pricePerSqft,
          modelVersion: prediction.modelVersion,
          algorithm: prediction.algorithm,
          datasetVersion: prediction.datasetVersion,
          featureImportance: prediction.featureImportance,
          inputFeatures: prediction.inputFeatures,
          createdAt: prediction.createdAt,
          disclaimer:
            'This is an ML model estimate based on synthetic training data. ' +
            'It is not a guaranteed market valuation.',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Prediction history ─────────────────────────────────────────────────────
export const getPredictionHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(50, parseInt((req.query.limit as string) || '10'));
    const skip = (page - 1) * limit;

    const [predictions, total] = await Promise.all([
      Prediction.find({ userId })
        .populate('propertyId', 'title location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Prediction.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get single prediction ──────────────────────────────────────────────────
export const getPrediction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    }).populate('propertyId', 'title location askingPrice');

    if (!prediction) {
      next(createError('Prediction not found.', 404, 'NOT_FOUND'));
      return;
    }

    res.json({ success: true, data: { prediction } });
  } catch (err) {
    next(err);
  }
};


