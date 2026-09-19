import { Response, NextFunction } from 'express';
import { Property } from '../models/Property';
import { SavedProperty } from '../models/SavedProperty';
import { Prediction } from '../models/Prediction';
import { audit } from '../utils/auditLogger';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// ── List / Search / Filter ─────────────────────────────────────────────────
export const getProperties = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      location,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      page = '1',
      limit = '12',
      search,
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (location) filter.location = location;
    if (propertyType) filter.propertyType = propertyType;
    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };
    if (minArea || maxArea) {
      filter.area = {};
      if (minArea) (filter.area as Record<string, number>).$gte = Number(minArea);
      if (maxArea) (filter.area as Record<string, number>).$lte = Number(maxArea);
    }
    if (minPrice || maxPrice) {
      filter.askingPrice = {};
      if (minPrice) (filter.askingPrice as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.askingPrice as Record<string, number>).$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Property.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get single property ────────────────────────────────────────────────────
export const getProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );
    if (!property) {
      next(createError('Property not found.', 404, 'NOT_FOUND'));
      return;
    }
    res.json({ success: true, data: { property } });
  } catch (err) {
    next(err);
  }
};

// ── Create property ────────────────────────────────────────────────────────
export const createProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const property = await Property.create({
      ...req.body,
      createdBy: req.user!._id,
    });

    await audit({
      userId: req.user!._id.toString(),
      action: 'PROPERTY_CREATED',
      resource: 'properties',
      resourceId: property._id.toString(),
      metadata: { title: property.title, location: property.location },
      ipAddress: req.ip as string | undefined,
    });

    res.status(201).json({ success: true, data: { property } });
  } catch (err) {
    next(err);
  }
};

// ── Update property ────────────────────────────────────────────────────────
export const updateProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      next(createError('Property not found.', 404, 'NOT_FOUND'));
      return;
    }

    // Only creator or ADMIN can update
    const isOwner = property.createdBy.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      next(createError('Not authorized to update this property.', 403, 'FORBIDDEN'));
      return;
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await audit({
      userId: req.user!._id.toString(),
      action: 'PROPERTY_UPDATED',
      resource: 'properties',
      resourceId: String(req.params.id),
      ipAddress: req.ip as string | undefined,
    });

    res.json({ success: true, data: { property: updated } });
  } catch (err) {
    next(err);
  }
};

// ── Delete property ────────────────────────────────────────────────────────
export const deleteProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      next(createError('Property not found.', 404, 'NOT_FOUND'));
      return;
    }

    const isOwner = property.createdBy.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      next(createError('Not authorized to delete this property.', 403, 'FORBIDDEN'));
      return;
    }

    await property.deleteOne();

    await audit({
      userId: req.user!._id.toString(),
      action: 'PROPERTY_DELETED',
      resource: 'properties',
      resourceId: String(req.params.id),
      ipAddress: req.ip as string | undefined,
    });

    res.json({ success: true, data: { message: 'Property deleted.' } });
  } catch (err) {
    next(err);
  }
};

// ── Save property ──────────────────────────────────────────────────────────
export const saveProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: propertyId } = req.params;
    const userId = req.user!._id.toString();

    const property = await Property.findById(propertyId);
    if (!property) {
      next(createError('Property not found.', 404, 'NOT_FOUND'));
      return;
    }

    try {
      await SavedProperty.create({ userId, propertyId });
    } catch (err: unknown) {
      const mongoErr = err as { code?: number };
      if (mongoErr.code === 11000) {
        next(createError('Property is already saved.', 409, 'ALREADY_SAVED'));
        return;
      }
      throw err;
    }

    await audit({ userId, action: 'PROPERTY_SAVED', resource: 'saved_properties', resourceId: String(propertyId), ipAddress: req.ip as string | undefined });

    res.status(201).json({ success: true, data: { message: 'Property saved.' } });
  } catch (err) {
    next(err);
  }
};

// ── Unsave property ────────────────────────────────────────────────────────
export const unsaveProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: propertyId } = req.params;
    const userId = req.user!._id.toString();

    const deleted = await SavedProperty.findOneAndDelete({ userId, propertyId });
    if (!deleted) {
      next(createError('Property is not saved.', 404, 'NOT_FOUND'));
      return;
    }

    await audit({ userId, action: 'PROPERTY_UNSAVED', resource: 'saved_properties', resourceId: String(propertyId), ipAddress: req.ip as string | undefined });

    res.json({ success: true, data: { message: 'Property removed from saved.' } });
  } catch (err) {
    next(err);
  }
};

// ── Get saved properties ───────────────────────────────────────────────────
export const getSavedProperties = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const saved = await SavedProperty.find({ userId })
      .populate({ path: 'propertyId', populate: { path: 'createdBy', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { savedProperties: saved.map((s) => s.propertyId) },
    });
  } catch (err) {
    next(err);
  }
};

// ── Compare properties ─────────────────────────────────────────────────────
export const compareProperties = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!ids || ids.length < 2) {
      next(createError('Provide at least 2 property IDs to compare.', 400, 'VALIDATION_ERROR'));
      return;
    }
    if (ids.length > 5) {
      next(createError('Cannot compare more than 5 properties at once.', 400, 'VALIDATION_ERROR'));
      return;
    }

    const properties = await Property.find({ _id: { $in: ids } });

    // Fetch latest prediction for each property
    const comparisons = await Promise.all(
      properties.map(async (prop) => {
        const latestPrediction = await Prediction.findOne({
          propertyId: prop._id,
        }).sort({ createdAt: -1 });

        const pricePerSqft = prop.askingPrice && prop.area > 0
          ? Math.round(prop.askingPrice / prop.area)
          : null;

        return {
          property: prop,
          estimatedValue: latestPrediction?.predictedPrice ?? null,
          estimatedPricePerSqft: latestPrediction?.pricePerSqft ?? null,
          pricePerSqft,
        };
      })
    );

    res.json({ success: true, data: { comparisons } });
  } catch (err) {
    next(err);
  }
};

// ── Upload Property Image ──────────────────────────────────────────────────
export const uploadPropertyImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      next(createError('No image file provided.', 400, 'FILE_MISSING'));
      return;
    }

    // Cloudinary returns `path` (public URL); disk storage returns `filename`.
    const imageUrl: string =
      (req.file as any).path ||          // Cloudinary URL
      `/uploads/${req.file.filename}`;    // local fallback

    res.status(201).json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename || imageUrl.split('/').pop(),
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err) {
    next(err);
  }
};


