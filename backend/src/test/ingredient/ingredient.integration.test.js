// Ingredient Integration Tests

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management_test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const { Ingredient } = require('../../models');

describe('Ingredient Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    await Ingredient.deleteMany({});
  });

  afterAll(async () => {
    await Ingredient.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/v1/ingredients', () => {
    test('Create new ingredient with all fields', async () => {
      const payload = {
        name: 'Bơ',
        unit: 'kg',
        quantity_in_stock: 10,
        minimum_quantity: 2,
        unit_price: 85000,
        supplier_name: 'ABC Supplier',
        supplier_contact: '0123456789',
        stock_status: 'available',
      };
      const res = await request(app).post('/api/v1/ingredients').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Bơ');
      expect(res.body.data.unit_price).toBe(85000);
    });

    test('Create ingredient with minimal required fields', async () => {
      const payload = {
        name: 'Muối',
        unit: 'kg',
        unit_price: 15000,
      };
      const res = await request(app).post('/api/v1/ingredients').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.quantity_in_stock).toBe(0);
      expect(res.body.data.stock_status).toBe('available');
    });

    test('Missing name should be rejected', async () => {
      const payload = {
        unit: 'kg',
        unit_price: 50000,
      };
      const res = await request(app).post('/api/v1/ingredients').send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('name');
    });

    test('Missing unit should be rejected', async () => {
      const payload = {
        name: 'Cà chua',
        unit_price: 25000,
      };
      const res = await request(app).post('/api/v1/ingredients').send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('unit');
    });

    test('Missing unit_price should be rejected', async () => {
      const payload = {
        name: 'Dầu ô liu',
        unit: 'lít',
      };
      const res = await request(app).post('/api/v1/ingredients').send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('unit_price');
    });

    test('Duplicate name should be rejected', async () => {
      const payload = {
        name: 'Hạt tiêu',
        unit: 'g',
        unit_price: 120000,
      };
      await request(app).post('/api/v1/ingredients').send(payload);
      const res = await request(app).post('/api/v1/ingredients').send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('GET /api/v1/ingredients', () => {
    test('Return array of ingredients', async () => {
      const res = await request(app).get('/api/v1/ingredients');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Returned ingredients have all required fields', async () => {
      const res = await request(app).get('/api/v1/ingredients');
      const ingredient = res.body.data[0];
      expect(ingredient).toHaveProperty('id');
      expect(ingredient).toHaveProperty('name');
      expect(ingredient).toHaveProperty('unit');
      expect(ingredient).toHaveProperty('quantity_in_stock');
      expect(ingredient).toHaveProperty('unit_price');
      expect(ingredient).toHaveProperty('stock_status');
    });
  });

  describe('GET /api/v1/ingredients/:id', () => {
    test('Get ingredient by ID', async () => {
      const createRes = await request(app).post('/api/v1/ingredients').send({
        name: 'Test Ingredient',
        unit: 'kg',
        unit_price: 50000,
      });
      const id = createRes.body.data.id;

      const res = await request(app).get(`/api/v1/ingredients/${id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.name).toBe('Test Ingredient');
      expect(res.body.data.id).toBe(id);
    });

    test('Get non-existent ingredient returns 404', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/v1/ingredients/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/v1/ingredients/:id', () => {
    test('Update ingredient with new values', async () => {
      const createRes = await request(app).post('/api/v1/ingredients').send({
        name: 'Update Test Ing',
        unit: 'kg',
        unit_price: 30000,
        quantity_in_stock: 5,
      });
      const id = createRes.body.data.id;

      const updateRes = await request(app).put(`/api/v1/ingredients/${id}`).send({
        name: 'Updated Name',
        unit_price: 40000,
        quantity_in_stock: 10,
      });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body).toHaveProperty('success', true);
      expect(updateRes.body.data.name).toBe('Updated Name');
      expect(updateRes.body.data.unit_price).toBe(40000);
      expect(updateRes.body.data.quantity_in_stock).toBe(10);
    });

    test('Update non-existent ingredient returns 404', async () => {
      const fakeId = '507f1f77bcf86cd799439012';
      const res = await request(app).put(`/api/v1/ingredients/${fakeId}`).send({
        name: 'Non-existent',
      });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });

    test('Update with duplicate name should be rejected', async () => {
      const payload1 = {
        name: 'Ingredient1',
        unit: 'kg',
        unit_price: 50000,
      };
      const payload2 = {
        name: 'Ingredient2',
        unit: 'kg',
        unit_price: 60000,
      };

      const res1 = await request(app).post('/api/v1/ingredients').send(payload1);
      const res2 = await request(app).post('/api/v1/ingredients').send(payload2);
      const id2 = res2.body.data.id;

      const updateRes = await request(app)
        .put(`/api/v1/ingredients/${id2}`)
        .send({ name: 'Ingredient1' });
      expect(updateRes.status).toBe(400);
      expect(updateRes.body).toHaveProperty('success', false);
      expect(updateRes.body.message).toContain('already exists');
    });
  });

  describe('PATCH /api/v1/ingredients/:id/quantity', () => {
    test('Update ingredient quantity', async () => {
      const createRes = await request(app).post('/api/v1/ingredients').send({
        name: 'Quantity Test',
        unit: 'kg',
        unit_price: 25000,
        quantity_in_stock: 5,
      });
      const id = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/v1/ingredients/${id}/quantity`)
        .send({ quantity_in_stock: 20 });
      expect(patchRes.status).toBe(200);
      expect(patchRes.body).toHaveProperty('success', true);
      expect(patchRes.body.data.quantity_in_stock).toBe(20);
    });

    test('Update quantity to zero is allowed', async () => {
      const createRes = await request(app).post('/api/v1/ingredients').send({
        name: 'Zero Quantity Test',
        unit: 'kg',
        unit_price: 30000,
        quantity_in_stock: 10,
      });
      const id = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/v1/ingredients/${id}/quantity`)
        .send({ quantity_in_stock: 0 });
      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.quantity_in_stock).toBe(0);
    });

    test('Missing quantity_in_stock should be rejected', async () => {
      const createRes = await request(app).post('/api/v1/ingredients').send({
        name: 'Missing Qty Test',
        unit: 'kg',
        unit_price: 35000,
      });
      const id = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/v1/ingredients/${id}/quantity`)
        .send({});
      expect(patchRes.status).toBe(400);
      expect(patchRes.body).toHaveProperty('success', false);
    });

    test('Negative quantity should be rejected', async () => {
      const createRes = await request(app).post('/api/v1/ingredients').send({
        name: 'Negative Qty Test',
        unit: 'kg',
        unit_price: 40000,
      });
      const id = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/v1/ingredients/${id}/quantity`)
        .send({ quantity_in_stock: -5 });
      expect(patchRes.status).toBe(400);
      expect(patchRes.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/v1/ingredients/:id', () => {
    test('Delete ingredient', async () => {
      const createRes = await request(app).post('/api/v1/ingredients').send({
        name: 'Delete Test',
        unit: 'kg',
        unit_price: 45000,
      });
      const id = createRes.body.data.id;

      const deleteRes = await request(app).delete(`/api/v1/ingredients/${id}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toHaveProperty('success', true);

      // Verify deletion
      const getRes = await request(app).get(`/api/v1/ingredients/${id}`);
      expect(getRes.status).toBe(404);
    });

    test('Delete non-existent ingredient returns 404', async () => {
      const fakeId = '507f1f77bcf86cd799439013';
      const res = await request(app).delete(`/api/v1/ingredients/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
