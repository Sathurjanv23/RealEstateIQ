import { Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';

export async function createInquiry(req: Request, res: Response): Promise<void> {
  try {
    const { propertyId, propertyName, propertyLocation, name, phone, email, preferredDate, message } = req.body;

    if (!propertyId || !propertyName || !name || !phone) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: propertyId, propertyName, name, and phone are required.',
      });
      return;
    }

    const inquiry = await Inquiry.create({
      propertyId,
      propertyName,
      propertyLocation,
      name,
      phone,
      email,
      preferredDate,
      message,
    });

    // Send email notification asynchronously
    emailService.sendInquiryNotification({
      propertyName,
      propertyLocation,
      inquirerName: name,
      inquirerPhone: phone,
      inquirerEmail: email,
      preferredDate,
      message,
    }).catch((err) => {
      logger.error(`Error in background inquiry email: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      message: 'Viewing inquiry submitted successfully.',
      data: { inquiry },
    });
  } catch (err: any) {
    logger.error(`createInquiry error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry.',
      error: err.message,
    });
  }
}

export async function getInquiries(req: Request, res: Response): Promise<void> {
  try {
    const { propertyId, status, page = '1', limit = '20' } = req.query;
    const filter: Record<string, any> = {};

    if (propertyId) filter.propertyId = propertyId;
    if (status) filter.status = status;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Inquiry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err: any) {
    logger.error(`getInquiries error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiries.',
      error: err.message,
    });
  }
}
