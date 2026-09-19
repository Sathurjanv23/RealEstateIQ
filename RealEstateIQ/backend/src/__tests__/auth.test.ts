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

  it('POST /api/auth/google should reject empty credential', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/google should reject invalid google credential token', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'invalid.dummy.token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/send-otp should reject already registered email', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: 'demo@realestate-iq.com', name: 'Demo User' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/send-otp should send OTP code for new email', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: 'newotpuser@example.com', name: 'New OTP User' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('6-digit');
  });

  it('POST /api/auth/verify-register should reject incorrect OTP', async () => {
    const res = await request(app)
      .post('/api/auth/verify-register')
      .send({
        name: 'New OTP User',
        email: 'newotpuser@example.com',
        password: 'Password@123',
        otp: '000000',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});


