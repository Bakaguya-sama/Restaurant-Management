const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Promotion } = require('../../models');
const mongoose = require('mongoose');

describe('Promotion Integration Tests', () => {
  let createdPromotionId;
  let testPromoCode;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (createdPromotionId) {
      await Promotion.findByIdAndDelete(createdPromotionId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/promotions - Create Promotion', () => {
    it('should create a percentage discount promotion', async () => {
      const newPromotion = {
        name: 'Test Summer Sale',
        promotion_type: 'percentage',
        discount_value: 20,
        minimum_order_amount: 300000,
        promo_code: `TEST${Date.now()}`,
        start_date: '2025-01-01',
        end_date: '2026-12-31',
        is_active: true,
        max_uses: 100
      };

      const response = await request(app)
        .post('/api/v1/promotions')
        .send(newPromotion)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newPromotion.name);
      expect(response.body.data.discount_value).toBe(newPromotion.discount_value);
      expect(response.body.data.promo_code).toBe(newPromotion.promo_code);
      
      createdPromotionId = response.body.data.id;
      testPromoCode = response.body.data.promo_code;
    });

    it('should create a fixed amount discount promotion', async () => {
      const newPromotion = {
        name: 'Test Fixed Discount',
        promotion_type: 'fixed_amount',
        discount_value: 50000,
        minimum_order_amount: 200000,
        promo_code: `FIXED${Date.now()}`,
        start_date: '2025-01-01',
        end_date: '2026-12-31',
        is_active: true
      };

      const response = await request(app)
        .post('/api/v1/promotions')
        .send(newPromotion)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.promotion_type).toBe('fixed_amount');
    });

    it('should fail when creating promotion with duplicate promo code', async () => {
      const duplicatePromotion = {
        name: 'Duplicate Promo',
        promotion_type: 'percentage',
        discount_value: 15,
        promo_code: testPromoCode,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/v1/promotions')
        .send(duplicatePromotion)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail when discount value is invalid', async () => {
      const invalidPromotion = {
        name: 'Invalid Discount',
        promotion_type: 'percentage',
        discount_value: 150,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/v1/promotions')
        .send(invalidPromotion)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/promotions - Get All Promotions', () => {
    it('should return list of all promotions', async () => {
      const response = await request(app)
        .get('/api/v1/promotions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter promotions by active status', async () => {
      const response = await request(app)
        .get('/api/v1/promotions?is_active=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter promotions by type', async () => {
      const response = await request(app)
        .get('/api/v1/promotions?promotion_type=percentage')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/promotions/:id - Get Promotion by ID', () => {
    it('should return promotion details', async () => {
      const response = await request(app)
        .get(`/api/v1/promotions/${createdPromotionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdPromotionId);
    });

    it('should fail when promotion not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/promotions/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/promotions/validate - Validate Promo Code', () => {
    it('should validate promo code successfully', async () => {
      const validation = {
        promo_code: testPromoCode,
        order_amount: 500000
      };

      const response = await request(app)
        .post('/api/v1/promotions/validate')
        .send(validation)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('discount_amount');
      expect(response.body.data.can_use).toBe(true);
    });

    it('should fail when order amount is below minimum', async () => {
      const validation = {
        promo_code: testPromoCode,
        order_amount: 100000
      };

      const response = await request(app)
        .post('/api/v1/promotions/validate')
        .send(validation)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/promotions/:id - Update Promotion', () => {
    it('should update promotion successfully', async () => {
      const updateData = {
        name: 'Updated Promotion Name',
        discount_value: 25
      };

      const response = await request(app)
        .put(`/api/v1/promotions/${createdPromotionId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.discount_value).toBe(updateData.discount_value);
    });
  });

  describe('PATCH /api/v1/promotions/:id/activate - Activate Promotion', () => {
    it('should activate promotion', async () => {
      const response = await request(app)
        .patch(`/api/v1/promotions/${createdPromotionId}/activate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_active).toBe(true);
    });
  });

  describe('PATCH /api/v1/promotions/:id/deactivate - Deactivate Promotion', () => {
    it('should deactivate promotion', async () => {
      const response = await request(app)
        .patch(`/api/v1/promotions/${createdPromotionId}/deactivate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_active).toBe(false);
    });
  });

  describe('GET /api/v1/promotions/statistics - Get Promotion Statistics', () => {
    it('should return promotion statistics', async () => {
      const response = await request(app)
        .get('/api/v1/promotions/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('valid');
    });
  });

  describe('DELETE /api/v1/promotions/:id - Delete Promotion', () => {
    it('should delete promotion successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/promotions/${createdPromotionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');
      
      createdPromotionId = null;
    });
  });
});
