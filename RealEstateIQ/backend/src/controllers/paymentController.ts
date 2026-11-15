import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Payment, PackageType } from '../models/Payment';
import { Property } from '../models/Property';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const PRICING_PACKAGES = [
  {
    id: 'featured_listing_7d',
    title: 'Gold Boost (7 Days)',
    description: 'Pin your property to the top of search results and category pages for 7 days. 5x more buyer views.',
    price: 2500,
    currency: 'LKR',
    durationDays: 7,
    badge: 'Gold Featured',
    features: [
      'Top placement in search results',
      'Golden Featured luxury badge',
      '5x more buyer inquiries',
      'Active for 7 full days',
    ],
  },
  {
    id: 'featured_listing_30d',
    title: 'Platinum Boost (30 Days)',
    description: 'Maximum exposure for premium properties. Pinned on homepage, social media highlights, and top search ranking.',
    price: 7500,
    currency: 'LKR',
    durationDays: 30,
    badge: 'Platinum Luxury',
    popular: true,
    features: [
      'Homepage premium carousel spotlight',
      'Guaranteed #1 search ranking',
      'Platinum Luxury Shield badge',
      'Direct 1-click WhatsApp leads',
      'Active for 30 full days',
    ],
  },
  {
    id: 'agent_pro_monthly',
    title: 'Agent Pro Membership',
    description: 'Designed for top-producing Sri Lankan real estate agents, brokers, and developers.',
    price: 15000,
    currency: 'LKR',
    durationDays: 30,
    badge: 'Verified Agent',
    features: [
      'Verified Agent Official Blue Badge',
      'Unlimited property listings',
      '5 complimentary Platinum Boosts',
      'Direct buyer lead routing & CRM',
      'Priority telephone support',
    ],
  },
];

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || '1211149'; // Default PayHere Sandbox Merchant ID
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || '4OQc2uF4gVw8nJ6T9u8s7r'; // PayHere Sandbox Secret

// Helper to compute MD5 hash for PayHere
function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: number,
  currency: string,
  merchantSecret: string
): string {
  const formattedAmount = amount.toFixed(2);
  const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const rawString = `${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`;
  return crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();
}

// ── GET /api/payments/packages ──────────────────────────────────────────────
export const getPackages = (req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      packages: PRICING_PACKAGES,
      currency: 'LKR',
    },
  });
};

// ── POST /api/payments/checkout ─────────────────────────────────────────────
export const createCheckout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { packageId, propertyId, phone } = req.body;

    const pkg = PRICING_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      next(createError('Invalid pricing package selected.', 400, 'INVALID_PACKAGE'));
      return;
    }

    if (packageId.startsWith('featured_listing') && !propertyId) {
      next(createError('Property ID is required for a listing boost.', 400, 'PROPERTY_REQUIRED'));
      return;
    }

    let propertyTitle = 'RealEstateIQ Premium Package';
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        next(createError('Target property not found.', 404, 'PROPERTY_NOT_FOUND'));
        return;
      }
      propertyTitle = property.title;
    }

    const orderId = `REQ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      userId: req.user!._id,
      propertyId: propertyId || undefined,
      orderId,
      amount: pkg.price,
      currency: pkg.currency,
      packageType: pkg.id as PackageType,
      status: 'pending',
      paymentMethod: 'PAYHERE',
      customerDetails: {
        name: req.user!.name,
        email: req.user!.email,
        phone: phone || '+94770000000',
      },
      metadata: {
        propertyTitle,
        durationDays: pkg.durationDays,
      },
    });

    const hash = generatePayHereHash(
      PAYHERE_MERCHANT_ID,
      orderId,
      pkg.price,
      pkg.currency,
      PAYHERE_MERCHANT_SECRET
    );

    const baseUrl = process.env.FRONTEND_URL || 'https://real-estate-iq-pi.vercel.app';

    const payhereParams = {
      sandbox: process.env.NODE_ENV !== 'production' || process.env.PAYHERE_SANDBOX === 'true',
      merchant_id: PAYHERE_MERCHANT_ID,
      return_url: `${baseUrl}/payment/success?order_id=${orderId}`,
      cancel_url: `${baseUrl}/payment/cancel?order_id=${orderId}`,
      notify_url: `${process.env.BACKEND_URL || 'https://realestateiq-1.onrender.com'}/api/payments/payhere-notify`,
      order_id: orderId,
      items: `${pkg.title} — ${propertyTitle}`,
      amount: pkg.price.toFixed(2),
      currency: pkg.currency,
      hash: hash,
      first_name: req.user!.name.split(' ')[0] || req.user!.name,
      last_name: req.user!.name.split(' ').slice(1).join(' ') || 'Customer',
      email: req.user!.email,
      phone: phone || '+94770000000',
      address: 'Colombo, Sri Lanka',
      city: 'Colombo',
      country: 'Sri Lanka',
    };

    res.json({
      success: true,
      data: {
        orderId,
        paymentId: payment._id,
        payhereParams,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/payments/payhere-notify (IPN Webhook) ─────────────────────────
export const handlePayHereNotify = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
    } = req.body;

    logger.info(`Received PayHere notification for Order: ${order_id}, Status: ${status_code}`);

    const secretHash = crypto.createHash('md5').update(PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase();
    const localHash = crypto
      .createHash('md5')
      .update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`)
      .digest('hex')
      .toUpperCase();

    // Verify hash authenticity
    if (localHash !== md5sig) {
      logger.warn(`PayHere signature mismatch for Order ${order_id}`);
      res.status(400).send('Signature verification failed');
      return;
    }

    const payment = await Payment.findOne({ orderId: order_id });
    if (!payment) {
      logger.warn(`Payment not found for orderId: ${order_id}`);
      res.status(404).send('Payment not found');
      return;
    }

    payment.payherePaymentId = payment_id;

    // Status code 2 = Success in PayHere
    if (status_code === '2' || status_code === 2) {
      payment.status = 'completed';
      await payment.save();

      // If featured listing, upgrade property
      if (payment.propertyId) {
        const pkg = PRICING_PACKAGES.find((p) => p.id === payment.packageType);
        const durationDays = pkg?.durationDays || 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        await Property.findByIdAndUpdate(payment.propertyId, {
          featured: true,
          featuredExpiresAt: expiresAt,
        });

        logger.info(`Property ${payment.propertyId} boosted to Featured until ${expiresAt.toISOString()}`);
      }

      // If Agent Pro subscription, upgrade user
      if (payment.packageType === 'agent_pro_monthly') {
        await User.findByIdAndUpdate(payment.userId, {
          isVerifiedAgent: true,
          subscriptionTier: 'pro',
        });
        logger.info(`User ${payment.userId} upgraded to Agent Pro`);
      }
    } else if (status_code === '0' || status_code === 0) {
      payment.status = 'pending';
      await payment.save();
    } else {
      payment.status = 'failed';
      await payment.save();
    }

    res.status(200).send('OK');
  } catch (err) {
    logger.error('Error handling PayHere notification:', err);
    next(err);
  }
};

// ── GET /api/payments/history ───────────────────────────────────────────────
export const getPaymentHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payments = await Payment.find({ userId: req.user!._id })
      .populate('propertyId', 'title location askingPrice images')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { payments },
    });
  } catch (err) {
    next(err);
  }
};
