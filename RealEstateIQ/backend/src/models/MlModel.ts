import mongoose, { Schema, Document } from 'mongoose';

export type ModelStatus = 'development' | 'staging' | 'production' | 'archived';

export interface IMlModel extends Document {
  modelName: string;
  version: string;
  algorithm: string;
  metrics: {
    mae: number;
    rmse: number;
    r2: number;
    cv_r2_mean?: number;
    cv_r2_std?: number;
  };
  featureImportance: Record<string, number>;
  datasetVersion: string;
  trainingDate: Date;
  status: ModelStatus;
  modelFile: string;
  trainSize: number;
  testSize: number;
  createdAt: Date;
  updatedAt: Date;
}

const mlModelSchema = new Schema<IMlModel>(
  {
    modelName: { type: String, required: true },
    version: { type: String, required: true, unique: true },
    algorithm: { type: String, required: true },
    metrics: {
      mae: { type: Number, required: true },
      rmse: { type: Number, required: true },
      r2: { type: Number, required: true },
      cv_r2_mean: Number,
      cv_r2_std: Number,
    },
    featureImportance: { type: Map, of: Number, default: {} },
    datasetVersion: { type: String, required: true },
    trainingDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['development', 'staging', 'production', 'archived'],
      default: 'development',
    },
    modelFile: { type: String, required: true },
    trainSize: { type: Number, required: true },
    testSize: { type: Number, required: true },
  },
  { timestamps: true }
);

mlModelSchema.index({ status: 1 });

export const MlModel = mongoose.model<IMlModel>('MlModel', mlModelSchema);
