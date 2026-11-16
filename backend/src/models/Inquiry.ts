import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiry extends Document {
  propertyId: mongoose.Types.ObjectId;
  propertyName: string;
  propertyLocation?: string;
  name: string;
  phone: string;
  email?: string;
  preferredDate?: string;
  message?: string;
  status: 'new' | 'contacted' | 'resolved' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property ID is required'],
    },
    propertyName: {
      type: String,
      required: [true, 'Property name is required'],
      trim: true,
    },
    propertyLocation: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Inquirer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    preferredDate: {
      type: String,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'resolved', 'cancelled'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

export const Inquiry = mongoose.model<IInquiry>('Inquiry', inquirySchema);
