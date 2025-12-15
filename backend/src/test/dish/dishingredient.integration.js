const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Dish, DishIngredient, Ingredient } = require('../../models');
const mongoose = require('mongoose');

describe('DishIngredient Integration Tests', () => {
  let createdDishId;
  let createdIngredientIds = [];

  beforeAll(async () => {
    await connectDB();

    // Create test dish
    const dish = new Dish({
      name: `Test Dish ${Date.now()}`,
      description: 'Test dish for ingredients',
      category: 'main_course',
      price: 350000
    });
    const savedDish = await dish.save();
    createdDishId = savedDish._id.toString();

    // Create test ingredients
    const ingredientNames = ['Tomato', 'Onion', 'Garlic'];
    for (const name of ingredientNames) {
      const ingredient = new Ingredient({
        name: `${name} ${Date.now()}`,
        unit: name === 'Garlic' ? 'cloves' : 'pieces',
        quantity_in_stock: 100,
        unit_price: 10000
      });
      const savedIngredient = await ingredient.save();
      createdIngredientIds.push(savedIngredient._id.toString());
    }
  });

  afterAll(async () => {
    if (createdDishId) {
      await Dish.findByIdAndDelete(createdDishId);
    }
    for (const ingredientId of createdIngredientIds) {
      await Ingredient.findByIdAndDelete(ingredientId);
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up dish ingredients before each test
    await DishIngredient.deleteMany({ dish_id: createdDishId });
  });

  describe('GET /api/v1/dishes/:id/ingredients - Get Dish Ingredients', () => {
    it('should retrieve ingredients for a dish', async () => {
      const response = await request(app)
        .get(`/api/v1/dishes/${createdDishId}/ingredients`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/dishes/${fakeId}/ingredients`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/dishes/:id/ingredients - Add Ingredient to Dish', () => {
    it('should add ingredient to dish successfully', async () => {
      const ingredientId = createdIngredientIds[0];

      const response = await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          ingredient_id: ingredientId,
          quantity_required: 200,
          unit: 'g'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.dish_id).toBe(createdDishId);
      expect(response.body.data.ingredient_id).toBe(ingredientId);
      expect(response.body.data.quantity_required).toBe(200);
      expect(response.body.data.unit).toBe('g');
    });

    it('should fail when adding ingredient without ingredient_id', async () => {
      const response = await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          quantity_required: 200,
          unit: 'g'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ingredient_id, quantity_required, and unit are required');
    });

    it('should fail when adding ingredient without quantity_required', async () => {
      const ingredientId = createdIngredientIds[1];

      const response = await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          ingredient_id: ingredientId,
          unit: 'g'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ingredient_id, quantity_required, and unit are required');
    });

    it('should fail when adding ingredient without unit', async () => {
      const ingredientId = createdIngredientIds[1];

      const response = await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          ingredient_id: ingredientId,
          quantity_required: 200
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ingredient_id, quantity_required, and unit are required');
    });

    it('should fail when adding non-existent ingredient', async () => {
      const fakeIngredientId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          ingredient_id: fakeIngredientId.toString(),
          quantity_required: 200,
          unit: 'g'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Ingredient not found');
    });

    it('should fail when adding same ingredient twice', async () => {
      const ingredientId = createdIngredientIds[0];

      // First add should succeed
      await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          ingredient_id: ingredientId,
          quantity_required: 200,
          unit: 'g'
        })
        .expect(201);

      // Second add should fail
      const response = await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          ingredient_id: ingredientId,
          quantity_required: 300,
          unit: 'g'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already added');
    });
  });

  describe('PUT /api/v1/dishes/:id/ingredients/:ingredientId - Update Dish Ingredient', () => {
    let testIngredientId;

    beforeEach(async () => {
      // Add ingredient first
      const ingredientId = createdIngredientIds[1];
      const response = await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          ingredient_id: ingredientId,
          quantity_required: 200,
          unit: 'g'
        });

      testIngredientId = ingredientId;
    });

    it('should update ingredient quantity successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/dishes/${createdDishId}/ingredients/${testIngredientId}`)
        .send({
          quantity_required: 250,
          unit: 'g'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity_required).toBe(250);
    });

    it('should update ingredient unit successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/dishes/${createdDishId}/ingredients/${testIngredientId}`)
        .send({
          quantity_required: 1,
          unit: 'kg'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unit).toBe('kg');
    });

    it('should fail when updating ingredient not in dish', async () => {
      const fakeIngredientId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/v1/dishes/${createdDishId}/ingredients/${fakeIngredientId}`)
        .send({
          quantity_required: 200,
          unit: 'g'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when updating with no data', async () => {
      const response = await request(app)
        .put(`/api/v1/dishes/${createdDishId}/ingredients/${testIngredientId}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/dishes/:id/ingredients/:ingredientId - Remove Ingredient from Dish', () => {
    let testIngredientId;

    beforeEach(async () => {
      // Add ingredient first
      const ingredientId = createdIngredientIds[2];
      await request(app)
        .post(`/api/v1/dishes/${createdDishId}/ingredients`)
        .send({
          ingredient_id: ingredientId,
          quantity_required: 200,
          unit: 'g'
        });

      testIngredientId = ingredientId;
    });

    it('should remove ingredient from dish successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/dishes/${createdDishId}/ingredients/${testIngredientId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Ingredient removed');
    });

    it('should fail when removing ingredient not in dish', async () => {
      const fakeIngredientId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/dishes/${createdDishId}/ingredients/${fakeIngredientId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when removing from non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/dishes/${fakeId}/ingredients/${testIngredientId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
