import axios, { AxiosError } from 'axios';
import { logger } from './logger';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export interface MlPredictInput {
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  house_age: number;
  parking: number;
}

export interface WaterfallFactor {
  id: string;
  feature: string;
  user_value: string;
  impact_lkr: number;
  shap_value: number;
  impact_percentage: number;
  direction: 'positive' | 'negative';
  explanation: string;
}

export interface ShapBreakdown {
  base_value_lkr: number;
  final_predicted_price_lkr: number;
  net_impact_lkr: number;
  factors: WaterfallFactor[];
  summary: string;
}

export interface MlPredictResponse {
  predicted_price: number;
  price_per_sqft: number | null;
  model_version: string;
  algorithm: string;
  dataset_version: string;
  feature_importance: Record<string, number>;
  shap_breakdown?: ShapBreakdown | null;
  disclaimer: string;
}

/**
 * Calls the Python ML service to get a price prediction.
 * Throws a descriptive error if the service is unavailable.
 */
export async function callMlPredict(input: MlPredictInput): Promise<MlPredictResponse> {
  try {
    const response = await mlClient.post<MlPredictResponse>('/predict', input);
    return response.data;
  } catch (error) {
    const axiosErr = error as AxiosError<{ detail: string }>;
    if (axiosErr.response) {
      const detail = axiosErr.response.data?.detail || 'Unknown ML service error';
      logger.error(`ML service returned ${axiosErr.response.status}: ${detail}`);
      throw new Error(`ML service error: ${detail}`);
    } else if (axiosErr.request) {
      logger.error('ML service unreachable:', axiosErr.message);
      throw new Error(
        'ML prediction service is currently unavailable. Please try again later.'
      );
    }
    throw error;
  }
}

export async function checkMlHealth(): Promise<boolean> {
  try {
    const resp = await mlClient.get('/health');
    return resp.data.model_loaded === true;
  } catch {
    return false;
  }
}

export async function getMlModelInfo(): Promise<Record<string, unknown> | null> {
  try {
    const resp = await mlClient.get('/model-info');
    return resp.data;
  } catch {
    return null;
  }
}

