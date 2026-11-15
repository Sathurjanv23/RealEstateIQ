import mongoose, { Schema, Document } from 'mongoose';
import { ALL_SL_LOCATIONS } from '../utils/sriLankaLocations';

export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'villa';
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'rejected';

export interface IProperty extends Document {
  title: string;
  description: string;
  propertyType: PropertyType;
  location: string;
  district: string;
  status: PropertyStatus;
  featured: boolean;
  area: number;
  landSize?: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  houseAge: number;
  amenities: string[];
  askingPrice?: number;
  latitude?: number;
  longitude?: number;
  images: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    propertyType: {
      type: String,
      enum: ['house', 'apartment', 'land', 'commercial', 'villa'],
      required: [true, 'Property type is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    district: { 
      type: String, 
      trim: true, 
      maxlength: 100,
      default: function(this: IProperty) {
        return this.location;
      }
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold', 'rejected'],
      default: 'active',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be positive'],
    },
    landSize: { type: Number, min: 0 },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    parking: { type: Number, default: 0, min: 0 },
    houseAge: {
      type: Number,
      required: true,
      min: 0,
      max: 200,
    },
    amenities: [{ type: String, trim: true }],
    askingPrice: { type: Number, min: 0 },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    images: [{ type: String }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// High-performance compound indexes for zero-lag queries under 10k users
propertySchema.index({ status: 1, featured: -1, createdAt: -1 });
propertySchema.index({ status: 1, location: 1, askingPrice: 1 });
propertySchema.index({ status: 1, district: 1, askingPrice: 1 });
propertySchema.index({ status: 1, propertyType: 1, askingPrice: 1 });
propertySchema.index({ bedrooms: 1, bathrooms: 1 });
propertySchema.index({ area: 1 });
propertySchema.index({ askingPrice: 1 });
propertySchema.index({ createdAt: -1 });

// Full-text search index for fast keyword lookup
propertySchema.index(
  { title: 'text', description: 'text', district: 'text', location: 'text' },
  { weights: { title: 10, district: 5, location: 5, description: 1 } }
);

export const Property = mongoose.model<IProperty>('Property', propertySchema);
