const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { Rating, RatingReply, User, Customer, StaffWaiter, Invoice, Order, Floor, Location, Table } = require('../../models');

describe('Rating Integration Tests', () => {
  let createdRatingId;
  let createdReplyId;
  let testCustomerId;
  let testStaffId;
  let testInvoiceId;
  let testTableId;

  beforeAll(async () => {
    await connectDB();

    let customer = await Customer.findOne({ role: 'customer' });
    if (!customer) {
      customer = await Customer.create({
        full_name: 'Test Customer',
        email: `testcustomer${Date.now()}@test.com`,
        phone: '0900000001',
        password_hash: 'hashedpassword',
        role: 'customer',
        username: `testcust${Date.now()}`,
        is_active: true,
        membership_level: 'silver'
      });
    }
    testCustomerId = customer._id;

    let staff = await StaffWaiter.findOne({ role: 'waiter' });
    if (!staff) {
      staff = await StaffWaiter.create({
        full_name: 'Test Staff',
        username: `teststaff${Date.now()}`,
        email: `teststaff${Date.now()}@test.com`,
        phone: '0900000002',
        password_hash: 'hashedpassword',
        role: 'waiter',
        is_active: true
      });
    }
    testStaffId = staff._id;

    // Create Floor, Location, and Table for dine-in order
    let floor = await Floor.findOne({ floor_number: 401 });
    if (!floor) {
      floor = await Floor.create({
        floor_name: 'First Floor',
        floor_number: 401,
        status: 'active'
      });
    }

    let location = await Location.findOne({ name: 'Dining Area' });
    if (!location) {
      location = await Location.create({
        name: 'Dining Area',
        floor_id: floor._id,
        description: 'Main dining area',
        status: 'active'
      });
    }

    let table = await Table.findOne({ table_number: 1, location_id: location._id });
    if (!table) {
      table = await Table.create({
        table_number: 1,
        location_id: location._id,
        capacity: 4,
        status: 'free'
      });
    }
    testTableId = table._id;

    let invoice = await Invoice.findOne();
    if (!invoice) {
      const order = await Order.create({
        order_number: `TEST-ORD-${Date.now()}`,
        order_type: 'dine-in-customer',
        order_date: new Date(),
        order_time: '19:00',
        customer_id: testCustomerId,
        table_id: testTableId,
        status: 'completed',
        subtotal: 500000,
        tax: 50000,
        total_amount: 550000
      });

      invoice = await Invoice.create({
        invoice_number: `TEST-INV-${Date.now()}`,
        order_id: order._id,
        staff_id: testStaffId,
        customer_id: testCustomerId,
        invoice_date: new Date(),
        subtotal: 500000,
        tax: 50000,
        discount_amount: 0,
        total_amount: 550000,
        payment_method: 'cash',
        payment_status: 'paid',
        points_used: 0,
        points_earned: 55,
        paid_at: new Date()
      });
    }
    testInvoiceId = invoice._id;
  });

  afterAll(async () => {
    if (createdReplyId) {
      await RatingReply.findByIdAndDelete(createdReplyId).catch(() => {});
    }
    if (createdRatingId) {
      await Rating.findByIdAndDelete(createdRatingId).catch(() => {});
    }
  });

  describe('POST /api/v1/ratings - Create Rating', () => {
    it('should create new rating with invoice_id', async () => {
      const newRating = {
        customer_id: testCustomerId,
        invoice_id: testInvoiceId,
        score: 5,
        description: 'Excellent service and food quality'
      };

      const response = await request(app)
        .post('/api/v1/ratings')
        .send(newRating)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.score).toBe(newRating.score);
      expect(response.body.data.description).toBe(newRating.description);
      expect(response.body.data.invoice_id).toBe(testInvoiceId.toString());

      createdRatingId = response.body.data.id;
    });

    it('should fail when invoice_id is missing', async () => {
      const invalidRating = {
        customer_id: testCustomerId,
        score: 5,
        description: 'Missing invoice_id'
      };

      const response = await request(app)
        .post('/api/v1/ratings')
        .send(invalidRating)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when score is out of range', async () => {
      const invalidRating = {
        customer_id: testCustomerId,
        invoice_id: testInvoiceId,
        score: 6,
        comment: 'Invalid score',
        category: 'food'
      };

      const response = await request(app)
        .post('/api/v1/ratings')
        .send(invalidRating)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/ratings - Get All Ratings', () => {
    it('should return list of all ratings', async () => {
      const response = await request(app)
        .get('/api/v1/ratings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter by customer ID', async () => {
      const response = await request(app)
        .get(`/api/v1/ratings?customer_id=${testCustomerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter by invoice ID', async () => {
      const response = await request(app)
        .get(`/api/v1/ratings?invoice_id=${testInvoiceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].invoice_id).toBe(testInvoiceId.toString());
      }
    });

    it('should filter by minimum score', async () => {
      const response = await request(app)
        .get('/api/v1/ratings?min_score=4')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(rating => {
        expect(rating.score).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('GET /api/v1/ratings/invoice/:invoiceId - Get Ratings by Invoice', () => {
    it('should return ratings for specific invoice', async () => {
      const response = await request(app)
        .get(`/api/v1/ratings/invoice/${testInvoiceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
      response.body.data.forEach(rating => {
        expect(rating.invoice_id).toBe(testInvoiceId.toString());
      });
    });

    it('should fail when invoice ID is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/ratings/invoice/invalid-id')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/ratings/:id - Get Rating by ID', () => {
    it('should return rating details', async () => {
      const response = await request(app)
        .get(`/api/v1/ratings/${createdRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdRatingId);
    });

    it('should fail when rating not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/ratings/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/ratings/:id - Update Rating', () => {
    it('should update rating', async () => {
      const updates = {
        score: 4,
        description: 'Updated: Good service but room for improvement'
      };

      const response = await request(app)
        .put(`/api/v1/ratings/${createdRatingId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(updates.score);
      expect(response.body.data.description).toBe(updates.description);
    });
  });

  describe('POST /api/v1/ratings/:id/reply - Create Rating Reply', () => {
    it('should create reply to rating', async () => {
      const newReply = {
        staff_id: testStaffId,
        reply_text: 'Thank you for your feedback!'
      };

      const response = await request(app)
        .post('/api/v1/rating-replies')
        .send({ ...newReply, rating_id: createdRatingId })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.reply_text).toBe(newReply.reply_text);

      createdReplyId = response.body.data.id;
    });

    it('should fail when reply text is empty', async () => {
      const invalidReply = {
        staff_id: testStaffId,
        reply_text: ''
      };

      const response = await request(app)
        .post('/api/v1/rating-replies')
        .send({ ...invalidReply, rating_id: createdRatingId })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/ratings/:id/replies - Get Rating Replies', () => {
    it('should return all replies for rating', async () => {
      const response = await request(app)
        .get(`/api/v1/rating-replies/rating/${createdRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/v1/ratings/replies/:replyId - Update Rating Reply', () => {
    it('should update reply', async () => {
      const updates = {
        reply_text: 'Updated: We appreciate your valuable feedback!'
      };

      const response = await request(app)
        .put(`/api/v1/rating-replies/${createdReplyId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reply_text).toBe(updates.reply_text);
    });
  });

  describe('GET /api/v1/ratings/statistics - Get Statistics', () => {
    it('should return rating statistics', async () => {
      const response = await request(app)
        .get('/api/v1/ratings/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('average_score');
    });
  });

  describe('DELETE /api/v1/ratings/replies/:replyId - Delete Rating Reply', () => {
    it('should delete reply', async () => {
      const response = await request(app)
        .delete(`/api/v1/rating-replies/${createdReplyId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');

      createdReplyId = null;
    });
  });

  describe('DELETE /api/v1/ratings/:id - Delete Rating', () => {
    it('should delete rating and cascade delete replies', async () => {
      const response = await request(app)
        .delete(`/api/v1/ratings/${createdRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');

      createdRatingId = null;
    });
  });
});
