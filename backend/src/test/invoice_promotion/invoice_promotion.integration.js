const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { InvoicePromotion, Invoice, Promotion } = require('../../models');

describe('Invoice Promotion Integration Tests', () => {
  let createdInvoicePromotionId;
  let testInvoiceId;
  let testPromotionId;

  beforeAll(async () => {
    await connectDB();

    const invoice = await Invoice.findOne();
    testInvoiceId = invoice._id;

    const promotion = await Promotion.findOne({ is_active: true });
    testPromotionId = promotion._id;

    const existing = await InvoicePromotion.findOne({ 
      invoice_id: testInvoiceId, 
      promotion_id: testPromotionId 
    });
    if (existing) {
      await InvoicePromotion.findByIdAndDelete(existing._id);
    }
  });

  afterAll(async () => {
    if (createdInvoicePromotionId) {
      await InvoicePromotion.findByIdAndDelete(createdInvoicePromotionId);
    }
    await mongoose.connection.close();
  });

  describe('POST /api/v1/invoice-promotions - Create Invoice Promotion', () => {
    it('should create invoice promotion', async () => {
      const newInvoicePromotion = {
        invoice_id: testInvoiceId,
        promotion_id: testPromotionId,
        discount_applied: 50000
      };

      const response = await request(app)
        .post('/api/v1/invoice-promotions')
        .send(newInvoicePromotion)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.discount_applied).toBe(newInvoicePromotion.discount_applied);

      createdInvoicePromotionId = response.body.data.id;
    });

    it('should fail when invoice promotion already exists', async () => {
      const duplicateInvoicePromotion = {
        invoice_id: testInvoiceId,
        promotion_id: testPromotionId,
        discount_applied: 30000
      };

      const response = await request(app)
        .post('/api/v1/invoice-promotions')
        .send(duplicateInvoicePromotion)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/invoice-promotions - Get All Invoice Promotions', () => {
    it('should return list of all invoice promotions', async () => {
      const response = await request(app)
        .get('/api/v1/invoice-promotions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter by invoice ID', async () => {
      const response = await request(app)
        .get(`/api/v1/invoice-promotions?invoice_id=${testInvoiceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/invoice-promotions/:id - Get Invoice Promotion by ID', () => {
    it('should return invoice promotion details', async () => {
      const response = await request(app)
        .get(`/api/v1/invoice-promotions/${createdInvoicePromotionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(createdInvoicePromotionId);
    });

    it('should fail when invoice promotion not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/invoice-promotions/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/invoice-promotions/invoice/:invoiceId - Get Promotions by Invoice', () => {
    it('should return promotions applied to invoice', async () => {
      const response = await request(app)
        .get(`/api/v1/invoice-promotions/invoice/${testInvoiceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/invoice-promotions/statistics - Get Statistics', () => {
    it('should return invoice promotion statistics', async () => {
      const response = await request(app)
        .get('/api/v1/invoice-promotions/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('total_discount');
    });
  });

  describe('DELETE /api/v1/invoice-promotions/:id - Delete Invoice Promotion', () => {
    it('should delete invoice promotion', async () => {
      const response = await request(app)
        .delete(`/api/v1/invoice-promotions/${createdInvoicePromotionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted successfully');

      createdInvoicePromotionId = null;
    });
  });
});
