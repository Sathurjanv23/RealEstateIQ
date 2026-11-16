import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'WITHDRAWN';
export type EmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'BUSINESS' | 'RETIRED' | 'STUDENT';

export interface IRentalApplication extends Document {
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  landlordId?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  monthlyIncome: number;
  employmentStatus: EmploymentStatus;
  employerOrBusinessName?: string;
  occupantsCount: number;
  hasPets: boolean;
  moveInDate: Date;
  leaseDurationMonths: number;
  additionalNotes?: string;
  identityVerificationConsent: boolean;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const rentalApplicationSchema = new Schema<IRentalApplication>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property ID is required'],
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    monthlyIncome: {
      type: Number,
      required: [true, 'Monthly income is required'],
      min: [0, 'Monthly income cannot be negative'],
    },
    employmentStatus: {
      type: String,
      enum: ['EMPLOYED', 'SELF_EMPLOYED', 'BUSINESS', 'RETIRED', 'STUDENT'],
      default: 'EMPLOYED',
    },
    employerOrBusinessName: {
      type: String,
      trim: true,
    },
    occupantsCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 20,
    },
    hasPets: {
      type: Boolean,
      default: false,
    },
    moveInDate: {
      type: Date,
      required: [true, 'Target move-in date is required'],
    },
    leaseDurationMonths: {
      type: Number,
      default: 12,
      min: 1,
      max: 60,
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    identityVerificationConsent: {
      type: Boolean,
      default: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DECLINED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

rentalApplicationSchema.index({ propertyId: 1, tenantId: 1, status: 1 });
rentalApplicationSchema.index({ tenantId: 1, createdAt: -1 });
rentalApplicationSchema.index({ landlordId: 1, createdAt: -1 });

export const RentalApplication = mongoose.model<IRentalApplication>(
  'RentalApplication',
  rentalApplicationSchema
);
