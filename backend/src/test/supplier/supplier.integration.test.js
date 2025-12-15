// Supplier Integration Tests

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management_test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const { Supplier } = require('../../models');

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

  describe('PUT /api/v1/suppliers/:id', () => {
    test('Update supplier info', async () => {
      // Tạo supplier mới
      const createRes = await request(app).post('/api/v1/suppliers').send({ name: 'UpdateTest', phone: '111', address: 'Addr1' });
      const id = createRes.body.data.id;
      // Gửi request update
      const updateRes = await request(app).put(`/api/v1/suppliers/${id}`).send({ name: 'UpdatedName', phone: '222', address: 'Addr2' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body).toHaveProperty('success', true);
      expect(updateRes.body.data.name).toBe('UpdatedName');
      expect(updateRes.body.data.phone).toBe('222');
      expect(updateRes.body.data.address).toBe('Addr2');
    });

    test('Update non-existent supplier returns 404', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).put(`/api/v1/suppliers/${fakeId}`).send({ name: 'Nope' });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/v1/suppliers/:id', () => {
    test('Delete supplier', async () => {
      // Tạo supplier mới
      const createRes = await request(app).post('/api/v1/suppliers').send({ name: 'DeleteTest', phone: '333', address: 'Addr3' });
      const id = createRes.body.data.id;
      // Xóa supplier
      const deleteRes = await request(app).delete(`/api/v1/suppliers/${id}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toHaveProperty('success', true);
      // Kiểm tra đã xóa thật chưa
      const getRes = await request(app).get('/api/v1/suppliers');
      const found = getRes.body.data.find(s => s.id === id);
      expect(found).toBeUndefined();
    });

    test('Delete non-existent supplier returns 404', async () => {
      const fakeId = '507f1f77bcf86cd799439012';
      const res = await request(app).delete(`/api/v1/suppliers/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
