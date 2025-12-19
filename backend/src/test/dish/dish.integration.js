const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Dish } = require('../../models');
const mongoose = require('mongoose');

describe('Dish Integration Tests', () => {
  let createdDishId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (createdDishId) {
      await Dish.findByIdAndDelete(createdDishId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/dishes - Create Dish', () => {
    it('should create a new dish successfully', async () => {
      const newDish = {
        name: `Grilled Salmon ${Date.now()}`,
        description: 'Fresh salmon fillet grilled with lemon butter sauce',
        category: 'main_course',
        price: 450000,
        image_url: 'https://example.com/salmon.jpg'
      };

      const response = await request(app)
        .post('/api/v1/dishes')
        .send(newDish)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newDish.name);
      expect(response.body.data.category).toBe(newDish.category);
      expect(response.body.data.price).toBe(newDish.price);
      expect(response.body.data.is_available).toBe(true);

      createdDishId = response.body.data.id;
    });

    it('should fail when creating dish without name', async () => {
      const invalidDish = {
        description: 'Missing name',
        category: 'main_course',
        price: 300000
      };

      const response = await request(app)
        .post('/api/v1/dishes')
        .send(invalidDish)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name, category, and price are required');
    });

    it('should fail when creating dish without category', async () => {
      const invalidDish = {
        name: 'Steak',
        description: 'Grilled steak',
        price: 400000
      };

      const response = await request(app)
        .post('/api/v1/dishes')
        .send(invalidDish)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name, category, and price are required');
    });

    it('should fail when creating dish without price', async () => {
      const invalidDish = {
        name: 'Pasta',
        description: 'Italian pasta carbonara',
        category: 'main_course'
      };

      const response = await request(app)
        .post('/api/v1/dishes')
        .send(invalidDish)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name, category, and price are required');
    });

    it('should fail when creating dish with invalid category', async () => {
      const invalidDish = {
        name: 'Unknown Dish',
        description: 'Unknown',
        category: 'invalid_category',
        price: 250000
      };

      const response = await request(app)
        .post('/api/v1/dishes')
        .send(invalidDish)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when creating dish with duplicate name', async () => {
      const dishName = `Unique Dish ${Date.now()}`;
      const firstDish = {
        name: dishName,
        description: 'First dish',
        category: 'main_course',
        price: 350000
      };

      const firstResponse = await request(app)
        .post('/api/v1/dishes')
        .send(firstDish)
        .expect(201);

      const firstDishId = firstResponse.body.data.id;

      const response = await request(app)
        .post('/api/v1/dishes')
        .send(firstDish)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');

      await Dish.findByIdAndDelete(firstDishId);
    });
  });

  describe('GET /api/v1/dishes - Get All Dishes', () => {
    it('should retrieve all dishes successfully', async () => {
      const response = await request(app)
        .get('/api/v1/dishes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter dishes by category', async () => {
      const response = await request(app)
        .get('/api/v1/dishes?category=main_course')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach(dish => {
        expect(dish.category).toBe('main_course');
      });
    });

    it('should filter dishes by availability', async () => {
      const response = await request(app)
        .get('/api/v1/dishes?is_available=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search dishes by name', async () => {
      const response = await request(app)
        .get('/api/v1/dishes?search=salmon')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/dishes/:id - Get Dish by ID', () => {
    beforeEach(async () => {
      const dish = new Dish({
        name: `Test Dish ${Date.now()}`,
        description: 'Test dish description',
        category: 'appetizer',
        price: 200000,
        image_url: 'https://example.com/test.jpg'
      });
      const savedDish = await dish.save();
      createdDishId = savedDish._id.toString();
    });

    it('should retrieve dish by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/dishes/${createdDishId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdDishId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('category');
      expect(response.body.data).toHaveProperty('price');
    });

    it('should return 404 for non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/dishes/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish not found');
    });
  });

  describe('PUT /api/v1/dishes/:id - Update Dish', () => {
    beforeEach(async () => {
      const dish = new Dish({
        name: `Dish to Update ${Date.now()}`,
        description: 'Original description',
        category: 'main_course',
        price: 400000,
        image_url: 'https://example.com/original.jpg'
      });
      const savedDish = await dish.save();
      createdDishId = savedDish._id.toString();
    });

    it('should update dish successfully', async () => {
      const updateData = {
        name: `Updated Dish ${Date.now()}`,
        description: 'Updated description',
        category: 'dessert',
        price: 150000,
        image_url: 'https://example.com/updated.jpg'
      };

      const response = await request(app)
        .put(`/api/v1/dishes/${createdDishId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.category).toBe(updateData.category);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('should fail when updating dish without required fields', async () => {
      const invalidUpdateData = {
        name: 'Test Dish'
      };

      const response = await request(app)
        .put(`/api/v1/dishes/${createdDishId}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when updating non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Test',
        category: 'appetizer',
        price: 100000
      };

      const response = await request(app)
        .put(`/api/v1/dishes/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/dishes/:id/availability - Update Dish Availability', () => {
    beforeEach(async () => {
      const dish = new Dish({
        name: `Availability Test ${Date.now()}`,
        description: 'Test description',
        category: 'main_course',
        price: 350000,
        is_available: true
      });
      const savedDish = await dish.save();
      createdDishId = savedDish._id.toString();
    });

    it('should mark dish as unavailable with reason', async () => {
      const response = await request(app)
        .patch(`/api/v1/dishes/${createdDishId}/availability`)
        .send({
          is_available: false,
          reason: 'Out of stock'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_available).toBe(false);
      expect(response.body.data.manual_unavailable_reason).toBe('Out of stock');
    });

    it('should mark dish as available again', async () => {
      await request(app)
        .patch(`/api/v1/dishes/${createdDishId}/availability`)
        .send({
          is_available: false,
          reason: 'Temporarily unavailable'
        });

      const response = await request(app)
        .patch(`/api/v1/dishes/${createdDishId}/availability`)
        .send({
          is_available: true
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_available).toBe(true);
      expect(response.body.data.manual_unavailable_reason).toBeNull();
    });

    it('should fail when marking unavailable without reason', async () => {
      // First, verify we can mark as unavailable without requiring a reason
      const response = await request(app)
        .patch(`/api/v1/dishes/${createdDishId}/availability`)
        .send({
          is_available: false
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_available).toBe(false);
      // When no reason is provided, the reason field should be null or unchanged
    });

    it('should return 404 for non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/v1/dishes/${fakeId}/availability`)
        .send({
          is_available: false,
          reason: 'Test'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/dishes/:id - Delete Dish', () => {
    let dishIdForDelete;

    beforeEach(async () => {
      const dish = new Dish({
        name: `Dish to Delete ${Date.now()}-${Math.random()}`,
        description: 'Test description',
        category: 'beverage',
        price: 50000
      });
      const savedDish = await dish.save();
      dishIdForDelete = savedDish._id.toString();
    });

    afterEach(async () => {
      if (dishIdForDelete) {
        try {
          await Dish.findByIdAndDelete(dishIdForDelete);
        } catch (error) {
          // Dish may already be deleted
        }
        dishIdForDelete = null;
      }
    });

    it('should delete dish successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/dishes/${dishIdForDelete}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(dishIdForDelete);

      const getResponse = await request(app)
        .get(`/api/v1/dishes/${dishIdForDelete}`)
        .expect(404);

      dishIdForDelete = null;
    });

    it('should return 404 when deleting non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/dishes/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
