import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import { connectDB } from '../config/database';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password@123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test_short_pw@example.com',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent_user_99999@example.com',
        password: 'Password@123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should successfully log in demo user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@realestate-iq.com',
        password: 'User@123456',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('demo@realestate-iq.com');
  });
});
