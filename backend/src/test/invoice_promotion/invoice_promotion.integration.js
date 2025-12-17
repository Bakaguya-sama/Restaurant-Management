const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { InvoicePromotion, Invoice, Promotion, Order, Customer, Staff } = require('../../models');

describe('Invoice Promotion Integration Tests', () => {
  let createdInvoicePromotionId;
  let testInvoiceId;
  let testPromotionId;

  beforeAll(async () => {
    await connectDB();

    let staff = await Staff.findOne({ role: 'cashier' });
    if (!staff) {
      staff = await Staff.create({
        full_name: 'Test Cashier',
        username: `cashier${Date.now()}`,
        email: `cashier${Date.now()}@test.com`,
        phone: '0900000006',
        password_hash: 'hashedpassword',
        role: 'cashier',
        status: 'active'
      });
    }

    let customer = await Customer.findOne();
    if (!customer) {
      customer = await Customer.create({
        full_name: 'Test Customer',
        email: `testcustpromo${Date.now()}@test.com`,
        phone: '0900000005',
        password_hash: 'hashedpassword',
        membership_level: 'silver'
      });
    }

    let order = await Order.findOne();
    if (!order) {
      order = await Order.create({
        customer_id: customer._id,
        order_number: `ORD${Date.now()}`,
        order_date: new Date(),
        order_time: '12:00',
        total_amount: 100000,
        status: 'completed'
      });
    }

    let invoice = await Invoice.findOne();
    if (!invoice) {
      invoice = await Invoice.create({
        order_id: order._id,
        staff_id: staff._id,
        customer_id: customer._id,
        invoice_number: `INV${Date.now()}`,
        invoice_date: new Date(),
        subtotal: 90000,
        tax: 10000,
        total_amount: 100000,
        payment_method: 'cash',
        payment_status: 'pending'
      });
    }
    testInvoiceId = invoice._id;

    let promotion = await Promotion.findOne({ is_active: true });
    if (!promotion) {
      promotion = await Promotion.create({
        name: 'Test Promotion',
        promo_code: `TESTPROMO${Date.now()}`,
        discount_value: 10000,
        promotion_type: 'percentage',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        is_active: true
      });
    }
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
      await InvoicePromotion.findByIdAndDelete(createdInvoicePromotionId).catch(() => {});
    }
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
