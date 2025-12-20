const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { Violation, Customer } = require('../../models');

describe('Violation Integration Tests', () => {
  let createdViolationId;
  let testCustomerId;

  beforeAll(async () => {
    await connectDB();

    // Create test customer if doesn't exist
    let customer = await Customer.findOne();
    if (!customer) {
      customer = await Customer.create({
        full_name: `Test Customer ${Date.now()}`,
        email: `customer${Date.now()}@test.com`,
        phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
        password_hash: 'hashed_password',
        membership_level: 'silver',
        points: 0
      });
    }
    testCustomerId = customer._id;
  });

  afterAll(async () => {
    if (createdViolationId) {
      await Violation.findByIdAndDelete(createdViolationId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/violations - Create Violation', () => {
    it('should create new violation', async () => {
      const newViolation = {
        customer_id: testCustomerId,
        violation_type: 'no_show',
        description: 'Customer did not show up for reservation'
      };

      const response = await request(app)
        .post('/api/v1/violations')
        .send(newViolation)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.violation_type).toBe(newViolation.violation_type);

      createdViolationId = response.body.data.id;
    });

    it('should fail when missing required fields', async () => {
      const invalidViolation = {
        customer_id: testCustomerId
      };

      const response = await request(app)
        .post('/api/v1/violations')
        .send(invalidViolation)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid violation type', async () => {
      const invalidViolation = {
        customer_id: testCustomerId,
        violation_type: 'invalid_type',
        description: 'Invalid violation type'
      };

      const response = await request(app)
        .post('/api/v1/violations')
        .send(invalidViolation)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/violations - Get All Violations', () => {
    it('should return list of all violations', async () => {
      const response = await request(app)
        .get('/api/v1/violations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/v1/violations?violation_type=no_show')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(violation => {
        expect(violation.violation_type).toBe('no_show');
      });
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();

      const response = await request(app)
        .get(`/api/v1/violations?start_date=${startDate}&end_date=${endDate}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/violations/:id - Get Violation by ID', () => {
    it('should return violation details', async () => {
      const response = await request(app)
        .get(`/api/v1/violations/${createdViolationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdViolationId);
    });

    it('should fail when violation not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/violations/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/violations/customer/:customerId - Get Violations by Customer', () => {
    it('should return all violations for customer', async () => {
      const response = await request(app)
        .get(`/api/v1/violations/customer/${testCustomerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(violation => {
        expect(violation.customer_id.toString()).toBe(testCustomerId.toString());
      });
    });

    it('should filter customer violations by type', async () => {
      const response = await request(app)
        .get(`/api/v1/violations/customer/${testCustomerId}?type=no_show`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('PUT /api/v1/violations/:id - Update Violation', () => {
    it('should update violation', async () => {
      const updates = {
        description: 'Updated description with more details',
        violation_type: 'late_cancel'
      };

      const response = await request(app)
        .put(`/api/v1/violations/${createdViolationId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.violation_type).toBe(updates.violation_type);
    });
  });

  describe('GET /api/v1/violations/statistics - Get Statistics', () => {
    it('should return violation statistics', async () => {
      const response = await request(app)
        .get('/api/v1/violations/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('by_type');
    });

    it('should filter statistics by type', async () => {
      const response = await request(app)
        .get('/api/v1/violations/statistics?violation_type=no_show')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
    });
  });

  describe('GET /api/v1/violations/statistics/top-violators - Get Top Violators', () => {
    it('should return top violators list', async () => {
      const response = await request(app)
        .get('/api/v1/violations/statistics/top-violators')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('customer_id');
        expect(response.body.data[0]).toHaveProperty('total_violations');
      }
    });

    it('should limit top violators list', async () => {
      const response = await request(app)
        .get('/api/v1/violations/statistics/top-violators?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('DELETE /api/v1/violations/:id - Delete Violation', () => {
    it('should delete violation', async () => {
      const response = await request(app)
        .delete(`/api/v1/violations/${createdViolationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');

      createdViolationId = null;
    });
  });
});
