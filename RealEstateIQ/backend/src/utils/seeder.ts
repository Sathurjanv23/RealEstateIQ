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
    description: 'Spacious villa in a quiet neighbourhood with modern amenities, private swimming pool, and landscaped courtyard.',
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
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Cozy 2BR Apartment in Kandy',
    description: 'Well-maintained apartment near Kandy city centre with scenic lake breeze and modern interior layout.',
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
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Beachside House in Galle',
    description: 'Charming house with sea breeze, 10 min from Galle Fort, featuring lush tropical gardens.',
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
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Family Home in Negombo',
    description: 'Spacious family home close to the beach and schools with solar panels and double garage.',
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
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Luxury 5BR Residence in Colombo 5',
    description: 'Premium residence with high-end finishes in Colombo 5 featuring private cinema, infinity pool, and gym.',
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
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Studio Apartment in Colombo 3',
    description: 'Modern studio apartment ideal for young professionals with panoramic skyline views and 24/7 security.',
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
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Hill Country Villa in Kandy',
    description: 'Serene villa with panoramic hill views in Kandy, surrounded by tea plantation hills and misty breezes.',
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
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Commercial Building in Negombo',
    description: 'Three-story commercial building near Negombo market with excellent high-visibility road frontage.',
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
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    ],
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

    // Seed / update properties with real photography
    for (const p of seedProperties) {
      await Property.findOneAndUpdate(
        { title: p.title },
        { $set: { ...p, createdBy: adminUser!._id } },
        { upsert: true, new: true }
      );
    }
    logger.info(`Seeded / updated ${seedProperties.length} sample properties with real photography.`);

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
