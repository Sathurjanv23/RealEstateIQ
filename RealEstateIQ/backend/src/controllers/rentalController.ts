import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RentalApplication, ApplicationStatus, EmploymentStatus } from '../models/RentalApplication';
import { Property } from '../models/Property';
import { logger } from '../utils/logger';

export async function createRentalApplication(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tenantId = req.user?._id;
    if (!tenantId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      propertyId,
      fullName,
      email,
      phone,
      monthlyIncome,
      employmentStatus = 'EMPLOYED',
      employerOrBusinessName,
      occupantsCount = 1,
      hasPets = false,
      moveInDate,
      leaseDurationMonths = 12,
      additionalNotes,
      identityVerificationConsent = true,
    } = req.body;

    if (!propertyId || !fullName || !email || !phone || monthlyIncome === undefined || !moveInDate) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: propertyId, fullName, email, phone, monthlyIncome, and moveInDate are required.',
      });
      return;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    const application = await RentalApplication.create({
      propertyId,
      tenantId,
      landlordId: property.createdBy,
      fullName,
      email,
      phone,
      monthlyIncome: Number(monthlyIncome),
      employmentStatus: employmentStatus as EmploymentStatus,
      employerOrBusinessName,
      occupantsCount: Number(occupantsCount) || 1,
      hasPets: Boolean(hasPets),
      moveInDate: new Date(moveInDate),
      leaseDurationMonths: Number(leaseDurationMonths) || 12,
      additionalNotes,
      identityVerificationConsent: Boolean(identityVerificationConsent),
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Rental application submitted successfully to landlord.',
      data: { application },
    });
  } catch (err: any) {
    logger.error(`createRentalApplication error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to submit rental application' });
  }
}

export async function getMyApplications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tenantId = req.user?._id;
    if (!tenantId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const applications = await RentalApplication.find({ tenantId })
      .populate('propertyId', 'title location district askingPrice images propertyType listingType rentalPeriod')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { applications },
    });
  } catch (err: any) {
    logger.error(`getMyApplications error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch rental applications' });
  }
}

export async function getReceivedApplications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const landlordId = req.user?._id;
    if (!landlordId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const applications = await RentalApplication.find({ landlordId })
      .populate('propertyId', 'title location district askingPrice images propertyType listingType rentalPeriod')
      .populate('tenantId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { applications },
    });
  } catch (err: any) {
    logger.error(`getReceivedApplications error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch received applications' });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { status } = req.body;

    const application = await RentalApplication.findById(id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const isLandlord = application.landlordId?.toString() === userId?.toString();
    const isTenant = application.tenantId.toString() === userId?.toString();
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isLandlord && !isTenant && !isAdmin) {
      res.status(403).json({ success: false, message: 'Unauthorized to modify this application' });
      return;
    }

    if (isTenant && status !== 'WITHDRAWN') {
      res.status(403).json({ success: false, message: 'Tenant may only withdraw an application' });
      return;
    }

    application.status = status as ApplicationStatus;
    await application.save();

    res.json({
      success: true,
      message: `Rental application marked as ${status}.`,
      data: { application },
    });
  } catch (err: any) {
    logger.error(`updateApplicationStatus error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
}
