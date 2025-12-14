// Supplier Integration Tests

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management_test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const { Supplier } = require('../../src/models');

describe('Supplier Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    await Supplier.deleteMany({});
  });

  afterAll(async () => {
    await Supplier.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/v1/suppliers', () => {
    test('Create new supplier', async () => {
      const payload = { name: 'ACME Supplies', phone: '0987654321', address: 'ACME Road' };
      const res = await request(app).post('/api/v1/suppliers').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('ACME Supplies');
    });

    test('Duplicate name should be rejected (case-insensitive)', async () => {
      const payload = { name: 'acme supplies', phone: '000', address: 'Nowhere' };
      const res = await request(app).post('/api/v1/suppliers').send(payload);
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/suppliers', () => {
    test('Return array of suppliers', async () => {
      const res = await request(app).get('/api/v1/suppliers');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
