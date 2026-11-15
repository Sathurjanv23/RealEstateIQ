import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PackageType = 
  | 'featured_listing_7d' 
  | 'featured_listing_30d' 
  | 'agent_pro_monthly' 
  | 'valuation_report';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  orderId: string;
  amount: number;
  currency: 'LKR' | 'USD';
  packageType: PackageType;
  status: PaymentStatus;
  paymentMethod: string;
  payherePaymentId?: string;
  customerDetails: {
    name: string;
    email: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['LKR', 'USD'],
      default: 'LKR',
    },
    packageType: {
      type: String,
      enum: ['featured_listing_7d', 'featured_listing_30d', 'agent_pro_monthly', 'valuation_report'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'PAYHERE',
    },
    payherePaymentId: {
      type: String,
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
