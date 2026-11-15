import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/realestate_iq';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'realestate_iq',
      maxPoolSize: 50, // Connection pool: handles up to 50 concurrent DB operations
      minPoolSize: 10,  // Pre-warmed pool for immediate response without cold starts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host} (Pool: min 10, max 50)`);
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      throw error;
    }
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});
