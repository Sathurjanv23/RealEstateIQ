import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Offer, OfferStatus, FinancingType } from '../models/Offer';
import { Property } from '../models/Property';
import { logger } from '../utils/logger';

export async function createOffer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buyerId = req.user?._id;
    if (!buyerId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      propertyId,
      offerAmount,
      buyerName,
      buyerEmail,
      buyerPhone,
      financingType = 'CASH',
      targetClosingDays = 30,
      termsMessage,
    } = req.body;

    if (!propertyId || !offerAmount || !buyerName || !buyerPhone || !buyerEmail) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: propertyId, offerAmount, buyerName, buyerEmail, and buyerPhone are required.',
      });
      return;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    const askingPrice = property.askingPrice || Number(offerAmount);
    const differencePercent = askingPrice > 0
      ? Number((((Number(offerAmount) - askingPrice) / askingPrice) * 100).toFixed(1))
      : 0;

    const offer = await Offer.create({
      propertyId,
      buyerId,
      sellerId: property.createdBy,
      buyerName,
      buyerEmail,
      buyerPhone,
      offerAmount: Number(offerAmount),
      askingPrice,
      differencePercent,
      financingType: financingType as FinancingType,
      targetClosingDays: Number(targetClosingDays) || 30,
      termsMessage,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully to seller.',
      data: { offer },
    });
  } catch (err: any) {
    logger.error(`createOffer error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to submit offer' });
  }
}

export async function getMyOffers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buyerId = req.user?._id;
    if (!buyerId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const offers = await Offer.find({ buyerId })
      .populate('propertyId', 'title location district askingPrice images propertyType listingType')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { offers },
    });
  } catch (err: any) {
    logger.error(`getMyOffers error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch your offers' });
  }
}

export async function getReceivedOffers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const sellerId = req.user?._id;
    if (!sellerId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const offers = await Offer.find({ sellerId })
      .populate('propertyId', 'title location district askingPrice images propertyType listingType')
      .populate('buyerId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { offers },
    });
  } catch (err: any) {
    logger.error(`getReceivedOffers error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch incoming offers' });
  }
}

export async function updateOfferStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { status, counterOfferAmount, counterMessage } = req.body;

    const offer = await Offer.findById(id);
    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found' });
      return;
    }

    // Ensure only seller (or buyer withdrawing) can update
    const isSeller = offer.sellerId?.toString() === userId?.toString();
    const isBuyer = offer.buyerId.toString() === userId?.toString();
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isSeller && !isBuyer && !isAdmin) {
      res.status(403).json({ success: false, message: 'Unauthorized to modify this offer' });
      return;
    }

    if (isBuyer && status !== 'WITHDRAWN') {
      res.status(403).json({ success: false, message: 'Buyer may only withdraw an offer' });
      return;
    }

    offer.status = status as OfferStatus;
    if (counterOfferAmount !== undefined) {
      offer.counterOfferAmount = Number(counterOfferAmount);
    }
    if (counterMessage !== undefined) {
      offer.counterMessage = counterMessage;
    }

    await offer.save();

    res.json({
      success: true,
      message: `Offer status updated to ${status}.`,
      data: { offer },
    });
  } catch (err: any) {
    logger.error(`updateOfferStatus error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to update offer status' });
  }
}
