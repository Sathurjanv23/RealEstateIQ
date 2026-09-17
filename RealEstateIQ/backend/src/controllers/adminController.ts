import { Response, NextFunction } from 'express';
import { Property } from '../models/Property';
import { Prediction } from '../models/Prediction';
import { User } from '../models/User';
import { SavedProperty } from '../models/SavedProperty';
import { MlModel } from '../models/MlModel';
import { Dataset } from '../models/Dataset';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { audit } from '../utils/auditLogger';

// ── Dashboard metrics ──────────────────────────────────────────────────────
export const getDashboardMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalPredictions,
      totalSaved,
      activeModel,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Prediction.countDocuments(),
      SavedProperty.countDocuments(),
      MlModel.findOne({ status: 'production' }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalPredictions,
        totalSaved,
        activeModel: activeModel
          ? {
              version: activeModel.version,
              algorithm: activeModel.algorithm,
              r2: activeModel.metrics.r2,
              mae: activeModel.metrics.mae,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── User management ────────────────────────────────────────────────────────
export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(50, parseInt((req.query.limit as string) || '20'));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { users, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) {
      next(createError('User not found.', 404, 'NOT_FOUND'));
      return;
    }

    await audit({
      userId: req.user!._id.toString(),
      action: 'ADMIN_USER_UPDATED',
      resource: 'users',
      resourceId: String(req.params.id),
      metadata: { newRole: role },
      ipAddress: req.ip as string | undefined,
    });

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.params.id === req.user!._id.toString()) {
      next(createError('You cannot delete your own account.', 400, 'VALIDATION_ERROR'));
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      next(createError('User not found.', 404, 'NOT_FOUND'));
      return;
    }

    await audit({
      userId: req.user!._id.toString(),
      action: 'ADMIN_USER_DELETED',
      resource: 'users',
      resourceId: String(req.params.id),
      ipAddress: req.ip as string | undefined,
    });

    res.json({ success: true, data: { message: 'User deleted.' } });
  } catch (err) {
    next(err);
  }
};

// ── Prediction analytics ───────────────────────────────────────────────────
export const getPredictionAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [total, byLocation, recentActivity] = await Promise.all([
      Prediction.countDocuments(),
      Prediction.aggregate([
        { $group: { _id: '$inputFeatures.location', count: { $sum: 1 }, avgPrice: { $avg: '$predictedPrice' } } },
        { $sort: { count: -1 } },
      ]),
      Prediction.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
    ]);

    res.json({
      success: true,
      data: { total, byLocation, recentActivity: recentActivity.reverse() },
    });
  } catch (err) {
    next(err);
  }
};

// ── ML Model management ─────────────────────────────────────────────────────
export const getMlModels = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const models = await MlModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { models } });
  } catch (err) {
    next(err);
  }
};

export const updateModelStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const model = await MlModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!model) {
      next(createError('Model not found.', 404, 'NOT_FOUND'));
      return;
    }

    await audit({
      userId: req.user!._id.toString(),
      action: 'MODEL_STATUS_CHANGED',
      resource: 'ml_models',
      resourceId: String(req.params.id),
      metadata: { newStatus: status, version: model.version },
      ipAddress: req.ip as string | undefined,
    });

    res.json({ success: true, data: { model } });
  } catch (err) {
    next(err);
  }
};

// ── Datasets ────────────────────────────────────────────────────────────────
export const getDatasets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const datasets = await Dataset.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { datasets } });
  } catch (err) {
    next(err);
  }
};

// ── Audit logs ──────────────────────────────────────────────────────────────
export const getAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(100, parseInt((req.query.limit as string) || '20'));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { logs, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    next(err);
  }
};

