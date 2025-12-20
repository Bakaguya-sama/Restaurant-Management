const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { RatingReply, Rating, User, StaffWaiter, Customer } = require('../../models');

describe('Rating Reply Integration Tests', () => {
  let createdReplyId;
  let testRatingId;
  let testStaffId;

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

    let rating = await Rating.findOne();
    if (!rating) {
      rating = await Rating.create({
        customer_id: customer._id,
        score: 5,
        description: 'Test rating for reply tests'
      });
    }
    testRatingId = rating._id;

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
  });

  afterAll(async () => {
    if (createdReplyId) {
      await RatingReply.findByIdAndDelete(createdReplyId).catch(() => {});
    }
  });

  describe('POST /api/v1/rating-replies - Create Rating Reply', () => {
    it('should create new rating reply', async () => {
      const newReply = {
        rating_id: testRatingId,
        staff_id: testStaffId,
        reply_text: 'Thank you for your feedback! We appreciate your comments.'
      };

      const response = await request(app)
        .post('/api/v1/rating-replies')
        .send(newReply)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.reply_text).toBe(newReply.reply_text);

      createdReplyId = response.body.data.id;
    });

    it('should fail when missing required fields', async () => {
      const invalidReply = {
        rating_id: testRatingId,
        reply_text: 'No staff ID provided'
      };

      const response = await request(app)
        .post('/api/v1/rating-replies')
        .send(invalidReply)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when reply text is empty', async () => {
      const invalidReply = {
        rating_id: testRatingId,
        staff_id: testStaffId,
        reply_text: ''
      };

      const response = await request(app)
        .post('/api/v1/rating-replies')
        .send(invalidReply)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('GET /api/v1/rating-replies - Get All Rating Replies', () => {
    it('should return list of all rating replies', async () => {
      const response = await request(app)
        .get('/api/v1/rating-replies')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter by rating ID', async () => {
      const response = await request(app)
        .get(`/api/v1/rating-replies?rating_id=${testRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter by staff ID', async () => {
      const response = await request(app)
        .get(`/api/v1/rating-replies?staff_id=${testStaffId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/rating-replies/:id - Get Rating Reply by ID', () => {
    it('should return rating reply details', async () => {
      const response = await request(app)
        .get(`/api/v1/rating-replies/${createdReplyId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdReplyId);
    });

    it('should fail when rating reply not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/rating-replies/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/rating-replies/rating/:ratingId - Get Replies by Rating', () => {
    it('should return all replies for specific rating', async () => {
      const response = await request(app)
        .get(`/api/v1/rating-replies/rating/${testRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail when rating not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/rating-replies/rating/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/rating-replies/staff/:staffId - Get Replies by Staff', () => {
    it('should return all replies by specific staff', async () => {
      const response = await request(app)
        .get(`/api/v1/rating-replies/staff/${testStaffId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail when staff not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/rating-replies/staff/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/rating-replies/:id - Update Rating Reply', () => {
    it('should update rating reply', async () => {
      const updates = {
        reply_text: 'Updated: We truly appreciate your valuable feedback and will continue to improve!'
      };

      const response = await request(app)
        .put(`/api/v1/rating-replies/${createdReplyId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reply_text).toBe(updates.reply_text);
    });

    it('should fail when updating with empty reply text', async () => {
      const updates = {
        reply_text: ''
      };

      const response = await request(app)
        .put(`/api/v1/rating-replies/${createdReplyId}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('empty');
    });

    it('should fail when reply text exceeds maximum length', async () => {
      const longText = 'a'.repeat(1001);
      const updates = {
        reply_text: longText
      };

      const response = await request(app)
        .put(`/api/v1/rating-replies/${createdReplyId}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exceed');
    });
  });

  describe('GET /api/v1/rating-replies/statistics - Get Statistics', () => {
    it('should return rating reply statistics', async () => {
      const response = await request(app)
        .get('/api/v1/rating-replies/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('by_staff');
      expect(response.body.data).toHaveProperty('recent_replies');
    });

    it('should filter statistics by staff', async () => {
      const response = await request(app)
        .get(`/api/v1/rating-replies/statistics?staff_id=${testStaffId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
    });
  });

  describe('GET /api/v1/rating-replies/statistics/top-staff - Get Top Responding Staff', () => {
    it('should return top responding staff', async () => {
      const response = await request(app)
        .get('/api/v1/rating-replies/statistics/top-staff')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should limit top staff list', async () => {
      const response = await request(app)
        .get('/api/v1/rating-replies/statistics/top-staff?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('DELETE /api/v1/rating-replies/:id - Delete Rating Reply', () => {
    it('should delete rating reply', async () => {
      const response = await request(app)
        .delete(`/api/v1/rating-replies/${createdReplyId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');

      createdReplyId = null;
    });

    it('should fail when deleting non-existent reply', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/rating-replies/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/rating-replies/rating/:ratingId - Delete All Replies for Rating', () => {
    beforeEach(async () => {
      const reply1 = new RatingReply({
        rating_id: testRatingId,
        staff_id: testStaffId,
        reply_text: 'Test reply 1'
      });
      await reply1.save();

      const reply2 = new RatingReply({
        rating_id: testRatingId,
        staff_id: testStaffId,
        reply_text: 'Test reply 2'
      });
      await reply2.save();
    });

    it('should delete all replies for a rating', async () => {
      const response = await request(app)
        .delete(`/api/v1/rating-replies/rating/${testRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedCount).toBeGreaterThanOrEqual(0);
    });

    it('should fail when rating not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/rating-replies/rating/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
