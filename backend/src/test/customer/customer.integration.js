const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Customer } = require('../../models');
const mongoose = require('mongoose');

describe('Customer Integration Tests', () => {
  let createdCustomerId;
  let authToken;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (createdCustomerId) {
      await Customer.findByIdAndDelete(createdCustomerId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/customers - Create Customer', () => {
    it('should create a new customer successfully', async () => {
      const newCustomer = {
        full_name: 'Test Customer',
        email: `testcustomer${Date.now()}@example.com`,
        phone: '0123456789',
        address: '456 Customer Street',
        date_of_birth: '1998-08-20',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/customers')
        .send(newCustomer)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.full_name).toBe(newCustomer.full_name);
      expect(response.body.data.email).toBe(newCustomer.email);
      expect(response.body.data.membership_level).toBe('regular');
      expect(response.body.data.points).toBe(0);
      
      createdCustomerId = response.body.data.id;
    });

    it('should fail when creating customer with duplicate email', async () => {
      const duplicateCustomer = {
        full_name: 'Duplicate Customer',
        email: 'customer1@example.com',
        phone: '0987654321',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/customers')
        .send(duplicateCustomer)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail when required fields are missing', async () => {
      const incompleteCustomer = {
        full_name: 'Incomplete Customer',
        email: 'incomplete@example.com'
      };

      const response = await request(app)
        .post('/api/v1/customers')
        .send(incompleteCustomer)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/customers - Get All Customers', () => {
    it('should return list of all customers', async () => {
      const response = await request(app)
        .get('/api/v1/customers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter customers by membership level', async () => {
      const response = await request(app)
        .get('/api/v1/customers?membership_level=regular')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should search customers by name', async () => {
      const response = await request(app)
        .get('/api/v1/customers?search=nguyen')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/customers/:id - Get Customer by ID', () => {
    it('should return customer details for valid ID', async () => {
      if (!createdCustomerId) {
        return;
      }

      const response = await request(app)
        .get(`/api/v1/customers/${createdCustomerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdCustomerId);
    });

    it('should return 404 for invalid ID', async () => {
      const invalidId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/customers/${invalidId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/customers/:id - Update Customer', () => {
    it('should update customer information', async () => {
      if (!createdCustomerId) {
        return;
      }

      const updateData = {
        full_name: 'Updated Customer Name',
        phone: '0999888777',
        address: 'New Address 789'
      };

      const response = await request(app)
        .put(`/api/v1/customers/${createdCustomerId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.full_name).toBe(updateData.full_name);
      expect(response.body.data.phone).toBe(updateData.phone);
    });
  });

  describe('PATCH /api/v1/customers/:id/points - Add Points', () => {
    it('should add points to customer account', async () => {
      if (!createdCustomerId) {
        return;
      }

      const pointsData = {
        points: 100
      };

      const response = await request(app)
        .patch(`/api/v1/customers/${createdCustomerId}/points`)
        .send(pointsData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.points).toBeGreaterThanOrEqual(100);
    });
  });

  describe('PATCH /api/v1/customers/:id/spending - Add Spending', () => {
    it('should add spending and auto-upgrade membership if threshold reached', async () => {
      if (!createdCustomerId) {
        return;
      }

      const spendingData = {
        amount: 1500000
      };

      const response = await request(app)
        .patch(`/api/v1/customers/${createdCustomerId}/spending`)
        .send(spendingData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_spent).toBeGreaterThanOrEqual(1500000);
    });
  });

  describe('PATCH /api/v1/customers/:id/ban - Ban Customer', () => {
    it('should ban a customer', async () => {
      if (!createdCustomerId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/v1/customers/${createdCustomerId}/ban`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isBanned).toBe(true);
    });
  });

  describe('PATCH /api/v1/customers/:id/unban - Unban Customer', () => {
    it('should unban a customer', async () => {
      if (!createdCustomerId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/v1/customers/${createdCustomerId}/unban`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isBanned).toBe(false);
    });
  });

  describe('GET /api/v1/customers/statistics - Get Customer Statistics', () => {
    it('should return customer statistics', async () => {
      const response = await request(app)
        .get('/api/v1/customers/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('banned');
      expect(response.body.data).toHaveProperty('byMembershipLevel');
    });
  });

  describe('GET /api/v1/customers/top - Get Top Customers', () => {
    it('should return top customers by spending', async () => {
      const response = await request(app)
        .get('/api/v1/customers/top')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should return top customers with custom limit', async () => {
      const response = await request(app)
        .get('/api/v1/customers/top?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('DELETE /api/v1/customers/:id - Delete Customer', () => {
    it('should delete a customer', async () => {
      if (!createdCustomerId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/v1/customers/${createdCustomerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');
      
      createdCustomerId = null;
    });
  });
});
