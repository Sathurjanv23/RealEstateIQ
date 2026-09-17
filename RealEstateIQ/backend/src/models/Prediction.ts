import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  inputFeatures: {
    area: number;
    bedrooms: number;
    bathrooms: number;
    location: string;
    house_age: number;
    parking: number;
  };
  predictedPrice: number;
  pricePerSqft: number | null;
  modelVersion: string;
  algorithm: string;
  datasetVersion: string;
  featureImportance: Record<string, number>;
  createdAt: Date;
}

const predictionSchema = new Schema<IPrediction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    inputFeatures: {
      area: { type: Number, required: true },
      bedrooms: { type: Number, required: true },
      bathrooms: { type: Number, required: true },
      location: { type: String, required: true },
      house_age: { type: Number, required: true },
      parking: { type: Number, required: true },
    },
    predictedPrice: { type: Number, required: true },
    pricePerSqft: { type: Number, default: null },
    modelVersion: { type: String, required: true },
    algorithm: { type: String, required: true },
    datasetVersion: { type: String, required: true },
    featureImportance: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ createdAt: -1 });

export const Prediction = mongoose.model<IPrediction>('Prediction', predictionSchema);
