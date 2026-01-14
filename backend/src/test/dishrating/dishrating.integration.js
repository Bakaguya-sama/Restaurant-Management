const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { DishRating, Rating, Dish, User, Customer, StaffWaiter, Invoice, Order, Floor, Location, Table } = require('../../models');

describe('DishRating Integration Tests', () => {
  let createdDishRatingId;
  let testCustomerId;
  let testStaffId;
  let testInvoiceId;
  let testDishId;
  let testRatingId;
  let testTableId;

  beforeAll(async () => {
    await connectDB();

    let customer = await Customer.findOne({ role: 'customer' });
    if (!customer) {
      customer = await Customer.create({
        full_name: 'Test Customer Dish Rating',
        email: `testcustomer${Date.now()}@test.com`,
        phone: '0900000011',
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
        full_name: 'Test Staff Dish Rating',
        username: `teststaff${Date.now()}`,
        email: `teststaff${Date.now()}@test.com`,
        phone: '0900000012',
        password_hash: 'hashedpassword',
        role: 'waiter',
        is_active: true
      });
    }
    testStaffId = staff._id;

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

    let dish = await Dish.findOne();
    if (!dish) {
      dish = await Dish.create({
        name: 'Test Dish for Rating',
        description: 'A delicious test dish',
        category: 'main_course',
        price: 150000,
        is_available: true
      });
    }
    testDishId = dish._id;

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

    let rating = await Rating.findOne({ invoice_id: testInvoiceId });
    if (!rating) {
      rating = await Rating.create({
        customer_id: testCustomerId,
        invoice_id: testInvoiceId,
        description: 'Great meal and service',
        rating_date: new Date(),
        score: 5
      });
    }
    testRatingId = rating._id;
  });

  afterAll(async () => {
    if (createdDishRatingId) {
      await DishRating.findByIdAndDelete(createdDishRatingId).catch(() => {});
    }
  });

  describe('POST /api/v1/dish-ratings - Create Dish Rating', () => {
    it('should create new dish rating', async () => {
      const newDishRating = {
        dish_id: testDishId,
        rating_id: testRatingId,
        score: 5,
        comment: 'Absolutely delicious and well-prepared'
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(newDishRating)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.score).toBe(newDishRating.score);
      expect(response.body.data.comment).toBe(newDishRating.comment);
      expect(response.body.data.dish_id).toBe(testDishId.toString());
      expect(response.body.data.rating_id).toBe(testRatingId.toString());

      createdDishRatingId = response.body.data.id;
    });

    it('should create dish rating without comment', async () => {
      const newDishRating = {
        dish_id: testDishId,
        rating_id: testRatingId,
        score: 4
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(newDishRating)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(4);
      expect(response.body.data.comment).toBeUndefined();
    });

    it('should fail when dish_id is missing', async () => {
      const invalidDishRating = {
        rating_id: testRatingId,
        score: 5,
        comment: 'Missing dish_id'
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(invalidDishRating)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish ID is required');
    });

    it('should fail when rating_id is missing', async () => {
      const invalidDishRating = {
        dish_id: testDishId,
        score: 5,
        comment: 'Missing rating_id'
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(invalidDishRating)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Rating ID is required');
    });

    it('should fail when score is missing', async () => {
      const invalidDishRating = {
        dish_id: testDishId,
        rating_id: testRatingId,
        comment: 'Missing score'
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(invalidDishRating)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Score is required');
    });

    it('should fail when score is below minimum (< 1)', async () => {
      const invalidDishRating = {
        dish_id: testDishId,
        rating_id: testRatingId,
        score: 0,
        comment: 'Invalid score'
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(invalidDishRating)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Score must be between 1 and 5');
    });

    it('should fail when score is above maximum (> 5)', async () => {
      const invalidDishRating = {
        dish_id: testDishId,
        rating_id: testRatingId,
        score: 6,
        comment: 'Invalid score'
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(invalidDishRating)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Score must be between 1 and 5');
    });

    it('should fail with non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const invalidDishRating = {
        dish_id: fakeId,
        rating_id: testRatingId,
        score: 5,
        comment: 'Non-existent dish'
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(invalidDishRating)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish not found');
    });

    it('should fail with non-existent rating', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const invalidDishRating = {
        dish_id: testDishId,
        rating_id: fakeId,
        score: 5,
        comment: 'Non-existent rating'
      };

      const response = await request(app)
        .post('/api/v1/dish-ratings')
        .send(invalidDishRating)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Rating not found');
    });
  });

  describe('GET /api/v1/dish-ratings - Get All Dish Ratings', () => {
    it('should return list of all dish ratings', async () => {
      const response = await request(app)
        .get('/api/v1/dish-ratings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });

    it('should filter by dish_id', async () => {
      const response = await request(app)
        .get(`/api/v1/dish-ratings?dish_id=${testDishId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(dr => {
        expect(dr.dish_id).toBe(testDishId.toString());
      });
    });

    it('should filter by rating_id', async () => {
      const response = await request(app)
        .get(`/api/v1/dish-ratings?rating_id=${testRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(dr => {
        expect(dr.rating_id).toBe(testRatingId.toString());
      });
    });

    it('should filter by exact score', async () => {
      const response = await request(app)
        .get(`/api/v1/dish-ratings?score=5`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(dr => {
        expect(dr.score).toBe(5);
      });
    });

    it('should filter by minimum score', async () => {
      const response = await request(app)
        .get('/api/v1/dish-ratings?min_score=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(dr => {
        expect(dr.score).toBeGreaterThanOrEqual(3);
      });
    });

    it('should filter by maximum score', async () => {
      const response = await request(app)
        .get('/api/v1/dish-ratings?max_score=4')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(dr => {
        expect(dr.score).toBeLessThanOrEqual(4);
      });
    });

    it('should filter by min and max score range', async () => {
      const response = await request(app)
        .get('/api/v1/dish-ratings?min_score=3&max_score=4')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(dr => {
        expect(dr.score).toBeGreaterThanOrEqual(3);
        expect(dr.score).toBeLessThanOrEqual(4);
      });
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/v1/dish-ratings?limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/v1/dish-ratings/:id - Get Dish Rating by ID', () => {
    it('should return dish rating details', async () => {
      const response = await request(app)
        .get(`/api/v1/dish-ratings/${createdDishRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdDishRatingId);
      expect(response.body.data.score).toBeDefined();
      expect(response.body.data.dish_id).toBeDefined();
      expect(response.body.data.rating_id).toBeDefined();
    });

    it('should fail when dish rating not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/dish-ratings/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish rating not found');
    });

    it('should fail with invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/dish-ratings/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dish-ratings/rating/:ratingId - Get Dish Ratings by Rating ID', () => {
    it('should return dish ratings for specific rating', async () => {
      const response = await request(app)
        .get(`/api/v1/dish-ratings/rating/${testRatingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(dr => {
        expect(dr.rating_id).toBe(testRatingId.toString());
      });
    });

    it('should fail with non-existent rating', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/dish-ratings/rating/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Rating not found');
    });
  });

  describe('GET /api/v1/dish-ratings/dish/:dishId - Get Dish Ratings by Dish ID', () => {
    it('should return dish ratings for specific dish', async () => {
      const response = await request(app)
        .get(`/api/v1/dish-ratings/dish/${testDishId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(dr => {
        expect(dr.dish_id).toBe(testDishId.toString());
      });
    });

    it('should fail with non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/dish-ratings/dish/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish not found');
    });
  });

  describe('PUT /api/v1/dish-ratings/:id - Update Dish Rating', () => {
    it('should update dish rating score', async () => {
      const updates = {
        score: 4
      };

      const response = await request(app)
        .put(`/api/v1/dish-ratings/${createdDishRatingId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(4);
    });

    it('should update dish rating comment', async () => {
      const updates = {
        comment: 'Updated comment: Very good dish'
      };

      const response = await request(app)
        .put(`/api/v1/dish-ratings/${createdDishRatingId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comment).toBe(updates.comment);
    });

    it('should update both score and comment', async () => {
      const updates = {
        score: 5,
        comment: 'Excellent dish with great flavors'
      };

      const response = await request(app)
        .put(`/api/v1/dish-ratings/${createdDishRatingId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(5);
      expect(response.body.data.comment).toBe(updates.comment);
    });

    it('should fail updating with invalid score', async () => {
      const updates = {
        score: 10
      };

      const response = await request(app)
        .put(`/api/v1/dish-ratings/${createdDishRatingId}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Score must be between 1 and 5');
    });

    it('should fail updating non-existent dish rating', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updates = {
        score: 4
      };

      const response = await request(app)
        .put(`/api/v1/dish-ratings/${fakeId}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish rating not found');
    });
  });

  describe('GET /api/v1/dish-ratings/dish/:dishId/average - Get Average Score', () => {
    it('should return average score for dish', async () => {
      const response = await request(app)
        .get(`/api/v1/dish-ratings/dish/${testDishId}/average`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data) {
        expect(response.body.data).toHaveProperty('averageScore');
        expect(response.body.data).toHaveProperty('count');
        expect(typeof response.body.data.averageScore).toBe('number');
        expect(response.body.data.count).toBeGreaterThan(0);
      }
    });

    it('should fail with non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/dish-ratings/dish/${fakeId}/average`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish not found');
    });
  });

  describe('DELETE /api/v1/dish-ratings/:id - Delete Dish Rating', () => {
    it('should delete dish rating', async () => {
      const newDishRating = {
        dish_id: testDishId,
        rating_id: testRatingId,
        score: 3,
        comment: 'To be deleted'
      };

      const createResponse = await request(app)
        .post('/api/v1/dish-ratings')
        .send(newDishRating)
        .expect(201);

      const dishRatingIdToDelete = createResponse.body.data.id;

      const deleteResponse = await request(app)
        .delete(`/api/v1/dish-ratings/${dishRatingIdToDelete}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await request(app)
        .get(`/api/v1/dish-ratings/${dishRatingIdToDelete}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });

    it('should fail deleting non-existent dish rating', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/dish-ratings/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish rating not found');
    });
  });

  describe('Combined Operations', () => {
    it('should create and retrieve multiple dish ratings for same rating', async () => {
      const dishRating1 = {
        dish_id: testDishId,
        rating_id: testRatingId,
        score: 5,
        comment: 'First dish was excellent'
      };

      const createResponse1 = await request(app)
        .post('/api/v1/dish-ratings')
        .send(dishRating1)
        .expect(201);

      const dishRatingId1 = createResponse1.body.data.id;

      const getResponse = await request(app)
        .get(`/api/v1/dish-ratings/rating/${testRatingId}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data).toBeInstanceOf(Array);
      expect(getResponse.body.data.length).toBeGreaterThanOrEqual(1);

      const found = getResponse.body.data.find(dr => dr.id === dishRatingId1);
      expect(found).toBeDefined();

      await DishRating.findByIdAndDelete(dishRatingId1).catch(() => {});
    });

    it('should handle multiple dish ratings for same dish', async () => {
      const ratings = [
        { score: 5, comment: 'Outstanding' },
        { score: 4, comment: 'Very good' },
        { score: 3, comment: 'Good' }
      ];

      const createdIds = [];

      for (const ratingData of ratings) {
        const response = await request(app)
          .post('/api/v1/dish-ratings')
          .send({
            dish_id: testDishId,
            rating_id: testRatingId,
            ...ratingData
          })
          .expect(201);
        createdIds.push(response.body.data.id);
      }

      const getResponse = await request(app)
        .get(`/api/v1/dish-ratings/dish/${testDishId}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.length).toBeGreaterThanOrEqual(1);

      for (const id of createdIds) {
        await DishRating.findByIdAndDelete(id).catch(() => {});
      }
    });
  });
});
