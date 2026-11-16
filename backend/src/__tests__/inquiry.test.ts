import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import { connectDB } from '../config/database';
import { Inquiry } from '../models/Inquiry';

describe('Inquiry Endpoints', () => {
  let token = '';
  let testInquiryId = '';

  beforeAll(async () => {
    await connectDB();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@realestate-iq.com', password: 'Admin@123456' });
    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    if (testInquiryId) {
      await Inquiry.findByIdAndDelete(testInquiryId);
    }
    await mongoose.connection.close();
  });

  it('POST /api/inquiries should submit a viewing inquiry', async () => {
    const dummyPropId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/inquiries')
      .send({
        propertyId: dummyPropId.toString(),
        propertyName: 'Luxury Penthouse in Colombo',
        propertyLocation: 'Colombo',
        name: 'John Doe',
        phone: '+94 77 123 4567',
        email: 'johndoe@example.com',
        preferredDate: '2026-10-01',
        message: 'Interested in a weekend morning viewing.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inquiry).toBeDefined();
    expect(res.body.data.inquiry.name).toBe('John Doe');
    expect(res.body.data.inquiry.status).toBe('new');
    testInquiryId = res.body.data.inquiry._id;
  });

  it('GET /api/inquiries should return inquiry list with auth', async () => {
    const res = await request(app)
      .get('/api/inquiries')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.inquiries)).toBe(true);
    expect(res.body.data.inquiries.length).toBeGreaterThan(0);
  });

  it('PATCH /api/inquiries/:id/status should update inquiry status', async () => {
    const res = await request(app)
      .patch(`/api/inquiries/${testInquiryId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'contacted' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inquiry.status).toBe('contacted');
  });

  it('DELETE /api/inquiries/:id should delete an inquiry', async () => {
    const res = await request(app)
      .delete(`/api/inquiries/${testInquiryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    testInquiryId = ''; // already deleted
  });
});
