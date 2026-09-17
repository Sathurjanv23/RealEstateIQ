import mongoose, { Schema, Document } from 'mongoose';

export interface IDataset extends Document {
  datasetName: string;
  version: string;
  rowCount: number;
  featureCount: number;
  features: string[];
  targetColumn: string;
  missingValueSummary: Record<string, number>;
  trainingDate: Date;
  modelVersion?: string;
  notes: string;
  createdAt: Date;
}

const datasetSchema = new Schema<IDataset>(
  {
    datasetName: { type: String, required: true },
    version: { type: String, required: true, unique: true },
    rowCount: { type: Number, required: true },
    featureCount: { type: Number, required: true },
    features: [{ type: String }],
    targetColumn: { type: String, required: true },
    missingValueSummary: { type: Map, of: Number, default: {} },
    trainingDate: { type: Date, required: true },
    modelVersion: String,
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Dataset = mongoose.model<IDataset>('Dataset', datasetSchema);
