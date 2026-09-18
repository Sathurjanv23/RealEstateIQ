import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { MlModel } from '../models/MlModel';
import { Dataset } from '../models/Dataset';
import { logger } from '../utils/logger';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/realestate_iq';

const seedProperties = [
  {
    title: 'Modern 3BR Villa in Colombo 7',
    description: 'Spacious villa in a quiet neighbourhood with modern amenities.',
    propertyType: 'villa',
    location: 'Colombo',
    district: 'Colombo 7',
    area: 2800,
    landSize: 8,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    houseAge: 3,
    amenities: ['Swimming Pool', 'Garden', 'Security'],
    askingPrice: 620000,
  },
  {
    title: 'Cozy 2BR Apartment in Kandy',
    description: 'Well-maintained apartment near Kandy city centre.',
    propertyType: 'apartment',
    location: 'Kandy',
    district: 'Kandy City',
    area: 1200,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    houseAge: 8,
    amenities: ['Parking', 'Security'],
    askingPrice: 270000,
  },
  {
    title: 'Beachside House in Galle',
    description: 'Charming house with sea breeze, 10 min from Galle Fort.',
    propertyType: 'house',
    location: 'Galle',
    district: 'Galle Town',
    area: 1800,
    landSize: 12,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    houseAge: 6,
    amenities: ['Garden', 'Veranda'],
    askingPrice: 390000,
  },
  {
    title: 'Family Home in Negombo',
    description: 'Spacious family home close to the beach and schools.',
    propertyType: 'house',
    location: 'Negombo',
    district: 'Negombo Town',
    area: 2200,
    landSize: 10,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    houseAge: 4,
    amenities: ['Garden', 'Parking', 'Solar Panels'],
    askingPrice: 470000,
  },
  {
    title: 'Luxury 5BR Residence in Colombo 5',
    description: 'Premium residence with high-end finishes in Colombo 5.',
    propertyType: 'house',
    location: 'Colombo',
    district: 'Colombo 5',
    area: 3200,
    landSize: 15,
    bedrooms: 5,
    bathrooms: 4,
    parking: 3,
    houseAge: 1,
    amenities: ['Swimming Pool', 'Home Theater', 'Gym', 'Solar Panels', 'Smart Home'],
    askingPrice: 770000,
  },
  {
    title: 'Studio Apartment in Colombo 3',
    description: 'Modern studio apartment ideal for young professionals.',
    propertyType: 'apartment',
    location: 'Colombo',
    district: 'Colombo 3',
    area: 1000,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    houseAge: 10,
    amenities: ['Security', 'CCTV'],
    askingPrice: 250000,
  },
  {
    title: 'Hill Country Villa in Kandy',
    description: 'Serene villa with panoramic hill views in Kandy.',
    propertyType: 'villa',
    location: 'Kandy',
    district: 'Peradeniya',
    area: 2500,
    landSize: 20,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    houseAge: 2,
    amenities: ['Garden', 'Mountain View', 'Solar Panels'],
    askingPrice: 580000,
  },
  {
    title: 'Commercial Building in Negombo',
    description: 'Three-story commercial building near Negombo market.',
    propertyType: 'commercial',
    location: 'Negombo',
    district: 'Negombo Town',
    area: 3000,
    bedrooms: 0,
    bathrooms: 2,
    parking: 3,
    houseAge: 5,
    amenities: ['Parking', '3 Floors', 'Road Frontage'],
    askingPrice: 750000,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'realestate_iq',
    });
    logger.info('Connected to MongoDB for seeding...');

    // Create admin + demo user
    const adminHash = await bcrypt.hash('Admin@123456', 12);
    const userHash = await bcrypt.hash('User@123456', 12);

    let adminUser = await User.findOne({ email: 'admin@realestate-iq.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@realestate-iq.com',
        passwordHash: adminHash,
        role: 'ADMIN',
      });
      logger.info('Admin user created: admin@realestate-iq.com / Admin@123456');
    }

    let demoUser = await User.findOne({ email: 'demo@realestate-iq.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo User',
        email: 'demo@realestate-iq.com',
        passwordHash: userHash,
        role: 'USER',
      });
      logger.info('Demo user created: demo@realestate-iq.com / User@123456');
    }

    // Seed properties
    const existingCount = await Property.countDocuments();
    if (existingCount === 0) {
      const created = await Property.insertMany(
        seedProperties.map((p) => ({ ...p, createdBy: adminUser!._id }))
      );
      logger.info(`Seeded ${created.length} sample properties.`);
    }

    // Seed ML model metadata (from actual training results)
    const existingModel = await MlModel.findOne({ version: 'LR-v1.0' });
    if (!existingModel) {
      await MlModel.create({
        modelName: 'Linear Regression House Price Model',
        version: 'LR-v1.0',
        algorithm: 'LinearRegression',
        metrics: {
          mae: 8126.70,
          rmse: 11157.90,
          r2: 0.9965,
          cv_r2_mean: 0.9954,
          cv_r2_std: 0.0013,
        },
        featureImportance: {
          area: 0.6999,
          bathrooms: 0.0723,
          bedrooms: 0.0568,
          house_age: 0.0483,
          'location_Galle': 0.0408,
          'location_Negombo': 0.0405,
          'location_Kandy': 0.0247,
          parking: 0.0167,
        },
        datasetVersion: 'v1.0-synthetic-100rows',
        trainingDate: new Date(),
        status: 'production',
        modelFile: 'pipeline_lr_v1.0.joblib',
        trainSize: 79,
        testSize: 20,
      });
      logger.info('ML model metadata seeded (LR-v1.0).');
    }

    // Seed dataset metadata
    const existingDataset = await Dataset.findOne({ version: 'v1.0-synthetic-100rows' });
    if (!existingDataset) {
      await Dataset.create({
        datasetName: 'RealEstateIQ House Price Dataset',
        version: 'v1.0-synthetic-100rows',
        rowCount: 100,
        featureCount: 6,
        features: ['area', 'bedrooms', 'bathrooms', 'location', 'house_age', 'parking'],
        targetColumn: 'price',
        missingValueSummary: {},
        trainingDate: new Date(),
        modelVersion: 'LR-v1.0',
        notes:
          'Synthetic dataset expanded from an original 10-row seed. Based on Sri Lanka real estate context. Not real market data.',
      });
      logger.info('Dataset metadata seeded.');
    }

    logger.info('Seeding complete.');
    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
