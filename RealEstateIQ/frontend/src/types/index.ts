export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: 'house' | 'apartment' | 'land' | 'commercial' | 'villa';
  location: 'Colombo' | 'Kandy' | 'Galle' | 'Negombo';
  district: string;
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
  createdBy: { name: string; email: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  _id: string;
  userId: string;
  propertyId?: string | Property;
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
  createdAt: string;
  disclaimer?: string;
}

export interface MlModel {
  _id: string;
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
  trainingDate: string;
  status: 'development' | 'staging' | 'production' | 'archived';
  modelFile: string;
  trainSize: number;
  testSize: number;
}

export interface Dataset {
  _id: string;
  datasetName: string;
  version: string;
  rowCount: number;
  featureCount: number;
  features: string[];
  targetColumn: string;
  missingValueSummary: Record<string, number>;
  trainingDate: string;
  modelVersion?: string;
  notes: string;
}

export interface AuditLog {
  _id: string;
  userId?: { name: string; email: string } | null;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface MarketAnalytics {
  overall: {
    count: number;
    avgPrice: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    avgArea: number | null;
    medianPrice: number | null;
    avgPricePerSqft: number | null;
  };
  byLocation: Array<{
    _id: string;
    count: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    avgArea: number;
  }>;
  byPropertyType: Array<{ _id: string; count: number; avgPrice: number }>;
  priceDistribution: Array<{ _id: number | string; count: number }>;
  note: string;
}

export interface Recommendation {
  property: Property;
  matchPercentage: number;
  score: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Inquiry {
  _id: string;
  propertyId: string;
  propertyName: string;
  propertyLocation?: string;
  name: string;
  phone: string;
  email?: string;
  preferredDate?: string;
  message?: string;
  status: 'new' | 'contacted' | 'resolved' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}
