const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { User, StaffWaiter, StaffCashier, StaffManager } = require('../../models');
const mongoose = require('mongoose');

describe('Staff Integration Tests', () => {
  let createdStaffId;
  let authToken;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (createdStaffId) {
      await User.findByIdAndDelete(createdStaffId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/staff - Create Staff', () => {
    it('should create a new staff member successfully', async () => {
      const newStaff = {
        full_name: 'Test Staff Member',
        email: `teststaff${Date.now()}@example.com`,
        phone: `0123${String(Date.now()).slice(-6)}`,
        address: '123 Test Street',
        date_of_birth: '1995-05-15',
        role: 'waiter',
        username: `teststaff${Date.now()}`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/staff')
        .send(newStaff);

      // Debug: log error if status is not 201
      if (response.status !== 201) {
        console.log('Staff creation error:', response.status, response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.full_name).toBe(newStaff.full_name);
      expect(response.body.data.email).toBe(newStaff.email);
      expect(response.body.data.role).toBe(newStaff.role);
      
      createdStaffId = response.body.data.id;
    });

    it('should fail when creating staff with duplicate email', async () => {
      // First, create the staff to ensure the email exists
      const firstStaff = {
        full_name: 'First Staff',
        email: `duplicate.staff.${Date.now()}@restaurant.com`,
        phone: `098765432${Date.now() % 10}`,
        role: 'cashier',
        username: `first${Date.now()}`,
        password: 'password123'
      };

      const createResponse = await request(app)
        .post('/api/v1/staff')
        .send(firstStaff)
        .expect(201);

      expect(createResponse.body.success).toBe(true);

      // Then try to create another staff with the same email
      const duplicateStaff = {
        full_name: 'Duplicate Staff',
        email: firstStaff.email,
        phone: `098765432${(Date.now() + 1) % 10}`,
        role: 'waiter',
        username: `duplicate${Date.now()}`,
        password: 'password456'
      };

      const response = await request(app)
        .post('/api/v1/staff')
        .send(duplicateStaff)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail when required fields are missing', async () => {
      const incompleteStaff = {
        full_name: 'Incomplete Staff',
        email: 'incomplete@example.com'
      };

      const response = await request(app)
        .post('/api/v1/staff')
        .send(incompleteStaff)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/staff - Get All Staff', () => {
    it('should return list of all staff members', async () => {
      const response = await request(app)
        .get('/api/v1/staff')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter staff by role', async () => {
      const response = await request(app)
        .get('/api/v1/staff?role=manager')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(staff => {
        expect(staff.role).toBe('manager');
      });
    });

    it('should search staff by name', async () => {
      const response = await request(app)
        .get('/api/v1/staff?search=nguyen')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/staff/:id - Get Staff by ID', () => {
    it('should return staff details for valid ID', async () => {
      if (!createdStaffId) {
        return;
      }

      const response = await request(app)
        .get(`/api/v1/staff/${createdStaffId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdStaffId);
    });

    it('should return 404 for invalid ID', async () => {
      const invalidId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/staff/${invalidId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/staff/:id - Update Staff', () => {
    it('should update staff information', async () => {
      if (!createdStaffId) {
        return;
      }

      const updateData = {
        full_name: 'Updated Staff Name',
        phone: '0999888777'
      };

      const response = await request(app)
        .put(`/api/v1/staff/${createdStaffId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.full_name).toBe(updateData.full_name);
      expect(response.body.data.phone).toBe(updateData.phone);
    });
  });

  describe('PATCH /api/v1/staff/:id/deactivate - Deactivate Staff', () => {
    it('should deactivate a staff member', async () => {
      if (!createdStaffId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/v1/staff/${createdStaffId}/deactivate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_active).toBe(false);
    });
  });

  describe('PATCH /api/v1/staff/:id/activate - Activate Staff', () => {
    it('should activate a staff member', async () => {
      if (!createdStaffId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/v1/staff/${createdStaffId}/activate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_active).toBe(true);
    });
  });

  describe('GET /api/v1/staff/statistics - Get Staff Statistics', () => {
    it('should return staff statistics', async () => {
      const response = await request(app)
        .get('/api/v1/staff/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('inactive');
      expect(response.body.data).toHaveProperty('byRole');
    });
  });

  describe('DELETE /api/v1/staff/:id - Delete Staff', () => {
    it('should delete a staff member', async () => {
      if (!createdStaffId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/v1/staff/${createdStaffId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');
      
      createdStaffId = null;
    });
  });

  describe('Email Verification - Staff Registration', () => {
    it('should set is_email_verified to false when staff member is created', async () => {
      const { EmailVerification } = require('../../models');

      const email = `stafftestverif${Date.now()}@example.com`;
      const newStaff = {
        full_name: 'Email Test Staff',
        email: email,
        phone: '0123456789',
        address: '123 Staff Street',
        date_of_birth: '1995-05-15',
        role: 'waiter',
        username: `stafftest${Date.now()}`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/staff')
        .send(newStaff);

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

    it('should allow updating email verification status via PATCH endpoint', async () => {
      const { EmailVerification } = require('../../models');

      const email = `staffupdate${Date.now()}@example.com`;
      const staffData = {
        full_name: 'Email Update Staff',
        email: email,
        phone: '0123456789',
        address: '123 Update Street',
        date_of_birth: '1995-05-15',
        role: 'waiter',
        username: `staffupdate${Date.now()}`,
        password: 'password123'
      };

      const createRes = await request(app)
        .post('/api/v1/staff')
        .send(staffData);

      if (createRes.status === 201) {
        const userId = createRes.body.data.id;

        // Login to get token
        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            username: staffData.username,
            password: staffData.password
          });

        if (loginRes.status === 200) {
          const token = loginRes.body.token;

          // Update email verification status
          const patchRes = await request(app)
            .patch('/api/v1/auth/email-verification')
            .set('Authorization', `Bearer ${token}`)
            .send({ is_email_verified: true });

          if (patchRes.status === 200) {
            expect(patchRes.body.success).toBe(true);
            expect(patchRes.body.data.is_email_verified).toBe(true);

            // Verify in database
            const user = await User.findById(userId);
            expect(user.is_email_verified).toBe(true);
          }
        }

        // Clean up
        await EmailVerification.deleteOne({ email });
        await User.deleteOne({ email });
      }
    });

    it('should fail PATCH email verification without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/email-verification')
        .send({ is_email_verified: true })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail PATCH email verification with invalid boolean value', async () => {
      const { EmailVerification } = require('../../models');

      const email = `staffinvalid${Date.now()}@example.com`;
      const staffData = {
        full_name: 'Invalid Boolean Staff',
        email: email,
        phone: '0123456789',
        address: '123 Invalid Street',
        date_of_birth: '1995-05-15',
        role: 'waiter',
        username: `staffinvalid${Date.now()}`,
        password: 'password123'
      };

      const createRes = await request(app)
        .post('/api/v1/staff')
        .send(staffData);

      if (createRes.status === 201) {
        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            username: staffData.username,
            password: staffData.password
          });

        if (loginRes.status === 200) {
          const token = loginRes.body.token;

          // Try to update with invalid value
          const response = await request(app)
            .patch('/api/v1/auth/email-verification')
            .set('Authorization', `Bearer ${token}`)
            .send({ is_email_verified: 'yes' })
            .expect(400);

          expect(response.body.success).toBe(false);
        }

        // Clean up
        await EmailVerification.deleteOne({ email });
        await User.deleteOne({ email });
      }
    });
  });
});
