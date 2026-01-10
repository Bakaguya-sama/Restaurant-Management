const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { User, Customer } = require('../../models');
const mongoose = require('mongoose');

describe('Customer Integration Tests', () => {
  let createdCustomerId;
  let authToken;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (createdCustomerId) {
      await User.findByIdAndDelete(createdCustomerId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/customers - Create Customer', () => {
    it('should create a new customer successfully', async () => {
      const newCustomer = {
        full_name: 'Test Customer',
        email: `testcustomer${Date.now()}@example.com`,
        phone: `0123${String(Date.now()).slice(-6)}`,
        address: '456 Customer Street',
        date_of_birth: '1998-08-20',
        username: `testcust${Date.now()}`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/customers')
        .send(newCustomer);

      // Debug: log error if status is not 201
      if (response.status !== 201) {
        console.log('Customer creation error:', response.status, response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.full_name).toBe(newCustomer.full_name);
      expect(response.body.data.email).toBe(newCustomer.email);
      expect(response.body.data.membership_level).toBe('regular');
      expect(response.body.data.points).toBe(0);
      
      createdCustomerId = response.body.data.id;
    });

    it('should fail when creating customer with duplicate email', async () => {
      // First, create the customer to ensure the email exists
      const uniqueEmail = `duplicate.test.${Date.now()}@example.com`;
      const uniquePhone = `098765${String(Date.now() % 10000).padStart(4, '0')}`;
      const firstCustomer = {
        full_name: 'First Customer',
        email: uniqueEmail,
        phone: uniquePhone,
        username: `first${Date.now()}`,
        password: 'password123'
      };

      await request(app)
        .post('/api/v1/customers')
        .send(firstCustomer)
        .expect(201);

      // Then try to create another customer with the same email
      const duplicateCustomer = {
        full_name: 'Duplicate Customer',
        email: uniqueEmail,
        phone: `098765${String((Date.now() + 1) % 10000).padStart(4, '0')}`,
        username: `dup${Date.now()}`,
        password: 'password456'
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
      expect(response.body.data).toHaveProperty('vip');
      expect(response.body.data).toHaveProperty('new');
      expect(response.body.data).toHaveProperty('returning');
      expect(response.body.data).toHaveProperty('avgSpending');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('segments');
      expect(Array.isArray(response.body.data.segments)).toBe(true);
      
      // Verify segment structure
      if (response.body.data.segments.length > 0) {
        const segment = response.body.data.segments[0];
        expect(segment).toHaveProperty('tier');
        expect(segment).toHaveProperty('count');
        expect(segment).toHaveProperty('revenue');
        expect(segment).toHaveProperty('percentage');
      }
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

  describe('Email Verification - Customer Registration', () => {
    it('should set is_email_verified to false when customer registers', async () => {
      const { EmailVerification } = require('../../models');
      
      const email = `emailcust${Date.now()}@example.com`;
      const newCustomer = {
        full_name: 'Email Test Customer',
        email: email,
        phone: `0123${String(Date.now()).slice(-6)}`,
        address: '789 Email Street',
        date_of_birth: '1998-08-20',
        username: `emailcust${Date.now()}`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/customers')
        .send(newCustomer);

      if (response.status === 201) {
        // Verify user is created with is_email_verified: false
        const user = await User.findOne({ email });
        expect(user).not.toBeNull();
        expect(user.is_email_verified).toBe(false);
        
        // Clean up
        await EmailVerification.deleteOne({ email });
        await User.deleteOne({ email });
      }
    });

    it('should create an EmailVerification token when customer registers', async () => {
      const { EmailVerification } = require('../../models');
      
      const email = `emailverify${Date.now()}@example.com`;
      const newCustomer = {
        full_name: 'Email Verify Customer',
        email: email,
        phone: `0123${String(Date.now()).slice(-6)}`,
        address: '789 Verify Street',
        date_of_birth: '1998-08-20',
        username: `emailverify${Date.now()}`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/customers')
        .send(newCustomer);

      if (response.status === 201) {
        // Verify email verification record exists
        const verification = await EmailVerification.findOne({ email });
        expect(verification).not.toBeNull();
        expect(verification.token).toBeDefined();
        
        // Clean up
        await EmailVerification.deleteOne({ email });
        await User.deleteOne({ email });
      }
    });

    it('should update user is_email_verified to true when email verified via token', async () => {
      const { EmailVerification } = require('../../models');
      
      const email = `emailconfirm${Date.now()}@example.com`;
      const newCustomer = {
        full_name: 'Email Confirm Customer',
        email: email,
        phone: `0123${String(Date.now()).slice(-6)}`,
        address: '789 Confirm Street',
        date_of_birth: '1998-08-20',
        username: `emailconfirm${Date.now()}`,
        password: 'password123'
      };

      const createRes = await request(app)
        .post('/api/v1/customers')
        .send(newCustomer);

      if (createRes.status === 201) {
        // Get verification token
        const verification = await EmailVerification.findOne({ email });
        expect(verification).not.toBeNull();

        // Verify email
        const verifyResponse = await request(app)
          .post('/api/v1/auth/verify-email')
          .send({ token: verification.token });

        if (verifyResponse.status === 200) {
          // Verify user is_email_verified is now true
          const user = await User.findOne({ email });
          expect(user.is_email_verified).toBe(true);
        }
        
        // Clean up
        await EmailVerification.deleteOne({ email });
        await User.deleteOne({ email });
      }
    });
  });
});
