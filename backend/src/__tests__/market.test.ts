import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import { connectDB } from '../config/database';

describe('Market & Model Info Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/market/model-info should return model version and metrics', async () => {
    const res = await request(app).get('/api/market/model-info');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.model_version).toBeDefined();
    expect(res.body.data.algorithm).toBeDefined();
  });

  it('GET /api/market/analytics should return aggregate market statistics', async () => {
    const res = await request(app).get('/api/market/analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overall).toBeDefined();
    expect(Array.isArray(res.body.data.byLocation)).toBe(true);
  });
});
