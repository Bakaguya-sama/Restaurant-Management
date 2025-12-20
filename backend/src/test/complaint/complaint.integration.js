const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { Complaint, Customer, User, StaffWaiter } = require('../../models');

describe('Complaint Integration Tests', () => {
  let createdComplaintId;
  let testCustomerId;
  let testStaffId;

  beforeAll(async () => {
    await connectDB();

    // Create test customer if doesn't exist
    let customer = await Customer.findOne({ role: 'customer' });
    if (!customer) {
      customer = await Customer.create({
        full_name: `Test Customer ${Date.now()}`,
        email: `customer${Date.now()}@test.com`,
        phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
        password_hash: 'hashed_password',
        role: 'customer',
        username: `testcust${Date.now()}`,
        is_active: true,
        membership_level: 'silver',
        points: 0
      });
    }
    testCustomerId = customer._id;

    // Create test staff if doesn't exist
    let staff = await StaffWaiter.findOne({ role: 'waiter' });
    if (!staff) {
      staff = await StaffWaiter.create({
        full_name: `Test Staff ${Date.now()}`,
        phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `staff${Date.now()}@test.com`,
        username: `staff${Date.now()}`,
        password_hash: 'hashed_password',
        role: 'waiter',
        is_active: true
      });
    }
    testStaffId = staff._id;
  });

  afterAll(async () => {
    if (createdComplaintId) {
      await Complaint.findByIdAndDelete(createdComplaintId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/complaints - Create Complaint', () => {
    it('should create new complaint', async () => {
      const newComplaint = {
        customer_id: testCustomerId,
        subject: 'Test Complaint',
        description: 'Integration test complaint',
        category: 'service',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/v1/complaints')
        .send(newComplaint)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.subject).toBe(newComplaint.subject);
      expect(response.body.data.status).toBe('open');

      createdComplaintId = response.body.data.id;
    });

    it('should fail when missing required fields', async () => {
      const invalidComplaint = {
        customer_id: testCustomerId,
        description: 'No title provided'
      };

      const response = await request(app)
        .post('/api/v1/complaints')
        .send(invalidComplaint)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/complaints - Get All Complaints', () => {
    it('should return list of all complaints', async () => {
      const response = await request(app)
        .get('/api/v1/complaints')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/complaints?status=open')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter by customer ID', async () => {
      const response = await request(app)
        .get(`/api/v1/complaints?customer_id=${testCustomerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/complaints/:id - Get Complaint by ID', () => {
    it('should return complaint details', async () => {
      const response = await request(app)
        .get(`/api/v1/complaints/${createdComplaintId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdComplaintId);
    });

    it('should fail when complaint not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/complaints/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/complaints/:id - Update Complaint', () => {
    it('should update complaint details', async () => {
      const updates = {
        priority: 'high',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v1/complaints/${createdComplaintId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe(updates.priority);
      expect(response.body.data.description).toBe(updates.description);
    });

    it('should fail when updating closed complaint', async () => {
      await Complaint.findByIdAndUpdate(createdComplaintId, { status: 'closed' });

      const updates = { priority: 'low' };

      const response = await request(app)
        .put(`/api/v1/complaints/${createdComplaintId}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('closed');

      await Complaint.findByIdAndUpdate(createdComplaintId, { status: 'open' });
    });
  });

  describe('PATCH /api/v1/complaints/:id/status - Update Complaint Status', () => {
    it('should update complaint status', async () => {
      const response = await request(app)
        .patch(`/api/v1/complaints/${createdComplaintId}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .patch(`/api/v1/complaints/${createdComplaintId}/status`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/complaints/:id/assign - Assign Complaint to Staff', () => {
    it('should assign complaint to staff', async () => {
      const response = await request(app)
        .patch(`/api/v1/complaints/${createdComplaintId}/assign`)
        .send({ staff_id: testStaffId })
        .expect(200);

      expect(response.body.success).toBe(true);
      const assignedStaffId = typeof response.body.data.assigned_to_staff_id === 'object' 
        ? response.body.data.assigned_to_staff_id._id 
        : response.body.data.assigned_to_staff_id;
      expect(assignedStaffId.toString()).toBe(testStaffId.toString());
    });

    it('should fail when staff not found', async () => {
      const fakeStaffId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/v1/complaints/${createdComplaintId}/assign`)
        .send({ staff_id: fakeStaffId })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/complaints/:id/resolve - Resolve Complaint', () => {
    it('should resolve complaint', async () => {
      await Complaint.findByIdAndUpdate(createdComplaintId, { status: 'in_progress' });

      const response = await request(app)
        .patch(`/api/v1/complaints/${createdComplaintId}/resolve`)
        .send({ resolution: 'Issue resolved successfully' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.resolution).toBe('Issue resolved successfully');
      expect(response.body.data.resolved_at).toBeDefined();
    });

    it('should fail when complaint is already closed', async () => {
      await Complaint.findByIdAndUpdate(createdComplaintId, { status: 'closed' });

      const response = await request(app)
        .patch(`/api/v1/complaints/${createdComplaintId}/resolve`)
        .send({ resolution: 'Trying to resolve closed complaint' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/complaints/statistics - Get Statistics', () => {
    it('should return complaint statistics', async () => {
      const response = await request(app)
        .get('/api/v1/complaints/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('open');
      expect(response.body.data).toHaveProperty('in_progress');
      expect(response.body.data).toHaveProperty('resolved');
      expect(response.body.data).toHaveProperty('closed');
      expect(response.body.data).toHaveProperty('by_category');
      expect(response.body.data).toHaveProperty('by_priority');
    });
  });

  describe('DELETE /api/v1/complaints/:id - Delete Complaint', () => {
    it('should delete complaint', async () => {
      const response = await request(app)
        .delete(`/api/v1/complaints/${createdComplaintId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');

      createdComplaintId = null;
    });
  });
});
