import mongoose, { Schema, Document } from 'mongoose';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'REJECTED' | 'WITHDRAWN';
export type FinancingType = 'CASH' | 'PRE_APPROVED_MORTGAGE' | 'CONTINGENT';

export interface IOffer extends Document {
  propertyId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  offerAmount: number;
  askingPrice: number;
  differencePercent: number;
  financingType: FinancingType;
  targetClosingDays: number;
  termsMessage?: string;
  status: OfferStatus;
  counterOfferAmount?: number;
  counterMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property ID is required'],
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer ID is required'],
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    buyerName: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: [true, 'Buyer email is required'],
      trim: true,
    },
    buyerPhone: {
      type: String,
      required: [true, 'Buyer phone is required'],
      trim: true,
    },
    offerAmount: {
      type: Number,
      required: [true, 'Offer amount is required'],
      min: [1, 'Offer amount must be positive'],
    },
    askingPrice: {
      type: Number,
      required: true,
    },
    differencePercent: {
      type: Number,
      required: true,
    },
    financingType: {
      type: String,
      enum: ['CASH', 'PRE_APPROVED_MORTGAGE', 'CONTINGENT'],
      default: 'CASH',
    },
    targetClosingDays: {
      type: Number,
      default: 30,
      min: 7,
      max: 180,
    },
    termsMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'COUNTERED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true,
    },
    counterOfferAmount: {
      type: Number,
      min: 0,
    },
    counterMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

offerSchema.index({ propertyId: 1, buyerId: 1, status: 1 });
offerSchema.index({ buyerId: 1, createdAt: -1 });
offerSchema.index({ sellerId: 1, createdAt: -1 });

export const Offer = mongoose.model<IOffer>('Offer', offerSchema);
