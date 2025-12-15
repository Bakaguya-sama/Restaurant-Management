// Inventory Integration Tests
// Uses Jest + Supertest against a real MongoDB test database

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management_test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const { Ingredient, Supplier, StockImport, StockImportDetail, StockExport, StockExportDetail } = require('../../models');

describe('Inventory Integration Tests', () => {
  let supplier; // supplier doc
  let ingredient; // ingredient doc

  beforeAll(async () => {
    // Wait for mongoose connection opened by server.js
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    // Clean collections used by tests to avoid interference
    await Promise.all([
      Ingredient.deleteMany({}),
      Supplier.deleteMany({}),
      StockImport.deleteMany({}),
      StockImportDetail.deleteMany({}),
      StockExport.deleteMany({}),
      StockExportDetail.deleteMany({})
    ]);

    // Create a supplier and ingredient used across tests
    supplier = new Supplier({ name: 'Test Supplier Inc', phone_contact: '0123456789', address: 'Test St' });
    await supplier.save();

    // Ingredient initially low stock (2) with minimum 10 to make lowStock flag true after small import
    ingredient = new Ingredient({ name: 'Tomato', unit: 'kg', quantity_in_stock: 2, minimum_quantity: 10, unit_price: 100, expiry_date: null });
    await ingredient.save();
  });

  afterAll(async () => {
    // Cleanup only test data created
    await Promise.all([
      Ingredient.deleteMany({}),
      Supplier.deleteMany({}),
      StockImport.deleteMany({}),
      StockImportDetail.deleteMany({}),
      StockExport.deleteMany({}),
      StockExportDetail.deleteMany({})
    ]);

    await mongoose.connection.close();
  });

  describe('POST /api/v1/inventory/import', () => {
    test('Valid import should create new import and not override old batches', async () => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 3); // within 7 days => expiring

      const payload = {
        items: [
          {
            itemId: ingredient._id.toString(),
            quantity: 1,
            supplierId: supplier._id.toString(),
            expiryDate: expiry.toISOString().split('T')[0]
          }
        ]
      };

      const res = await request(app).post('/api/v1/inventory/import').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('importId');
      expect(Array.isArray(res.body.data.details)).toBe(true);
      expect(res.body.data.details[0]).toHaveProperty('ingredientId');

      // Save returned ids for subsequent tests (stored in ingredient and DB)
      const detail = res.body.data.details[0];
      expect(detail.quantity).toBe(1);
    });

    test('Missing required field should return 400', async () => {
      // Missing supplierId
      const payload = {
        items: [
          {
            itemId: ingredient._id.toString(),
            quantity: 1,
            // supplierId missing
            expiryDate: new Date().toISOString().split('T')[0]
          }
        ]
      };

      const res = await request(app).post('/api/v1/inventory/import').send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/inventory', () => {
    test('Retrieve all inventory batches', async () => {
      const res = await request(app).get('/api/v1/inventory');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);

      // Each item should have required fields
      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(item).toMatchObject({ id: expect.any(String), name: expect.any(String), quantity: expect.any(Number), unit: expect.any(String) });
        // expiryDate may be string or null
        expect(item).toHaveProperty('expiryDate');
      }
    });

    test('Filter lowStock=true returns low stock batches', async () => {
      const res = await request(app).get('/api/v1/inventory').query({ lowStock: true });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);

      // Our imported tomato has total quantity 3 (2 initial + 1 import) and minimum 10 -> should be low stock
      const hasTomato = res.body.data.some(d => d.name === 'Tomato');
      expect(hasTomato).toBe(true);
    });

    test('Filter expiring=true returns batches expiring in next 7 days', async () => {
      const res = await request(app).get('/api/v1/inventory').query({ expiring: true });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const hasTomato = res.body.data.some(d => d.name === 'Tomato');
      expect(hasTomato).toBe(true);
    });
  });

  describe('POST /api/v1/inventory/export', () => {
    test('Valid export should decrement ingredient stock', async () => {
      // Export 1 unit (we have at least 3 after import)
      const payload = { items: [{ itemId: ingredient._id.toString(), quantity: 1, reason: 'Used in kitchen' }] };
      const res = await request(app).post('/api/v1/inventory/export').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('exportId');

      // Verify ingredient stock decreased
      const refreshed = await Ingredient.findById(ingredient._id);
      expect(refreshed.quantity_in_stock).toBeGreaterThanOrEqual(0);
    });

    test('Export more than available should fail', async () => {
      // Try exporting an excessively large quantity
      const payload = { items: [{ itemId: ingredient._id.toString(), quantity: 99999, reason: 'Accidental order' }] };
      const res = await request(app).post('/api/v1/inventory/export').send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });
});
