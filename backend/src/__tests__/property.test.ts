import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import { connectDB } from '../config/database';

describe('Property Endpoints', () => {
  let token = '';

  beforeAll(async () => {
    await connectDB();
    // Log in demo user to get JWT
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@realestate-iq.com', password: 'User@123456' });
    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/properties should return list of seeded properties', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.properties)).toBe(true);
    expect(res.body.data.properties.length).toBeGreaterThan(0);
  });

  it('GET /api/properties?location=Colombo should filter by location', async () => {
    const res = await request(app).get('/api/properties?location=Colombo');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    for (const prop of res.body.data.properties) {
      expect(prop.location).toBe('Colombo');
    }
  });

  it('POST /api/properties should reject property creation without auth', async () => {
    const res = await request(app)
      .post('/api/properties')
      .send({
        title: 'Unauthorized House',
        propertyType: 'house',
        location: 'Colombo',
        area: 2000,
        bedrooms: 3,
        bathrooms: 2,
        houseAge: 5,
      });

    expect(res.status).toBe(401);
  });

  it('POST /api/properties should reject invalid property payload with auth', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Hi', // too short
        propertyType: 'invalid_type',
        location: 'InvalidCity',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
