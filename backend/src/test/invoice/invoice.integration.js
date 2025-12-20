const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { Invoice, Order, User, StaffCashier, Customer } = require('../../models');

describe('Invoice Integration Tests', () => {
  let createdInvoiceId;
  let testOrderId;
  let testStaffId;
  let testCustomerId;

  beforeAll(async () => {
    await connectDB();

    let staff = await StaffCashier.findOne({ role: 'cashier' });
    if (!staff) {
      staff = await StaffCashier.create({
        full_name: 'Test Cashier',
        username: `testcashier${Date.now()}`,
        email: `testcashier${Date.now()}@test.com`,
        phone: '0900000003',
        password_hash: 'hashedpassword',
        role: 'cashier',
        is_active: true
      });
    }
    testStaffId = staff._id;

    let customer = await Customer.findOne({ role: 'customer' });
    if (!customer) {
      customer = await Customer.create({
        full_name: 'Test Customer Invoice',
        email: `testinvoicecust${Date.now()}@test.com`,
        phone: '0900000004',
        password_hash: 'hashedpassword',
        role: 'customer',
        username: `testcust${Date.now()}`,
        is_active: true,
        membership_level: 'silver'
      });
    }
    testCustomerId = customer._id;

    let order = await Order.findOne();
    if (!order) {
      order = await Order.create({
        customer_id: testCustomerId,
        order_number: `ORD${Date.now()}`,
        order_date: new Date(),
        order_time: '12:00',
        total_amount: 100000,
        status: 'completed'
      });
    }
    testOrderId = order._id;

    const existingInvoice = await Invoice.findOne({ order_id: testOrderId });
    if (existingInvoice) {
      await Invoice.findByIdAndDelete(existingInvoice._id);
    }
  });

  afterAll(async () => {
    if (createdInvoiceId) {
      await Invoice.findByIdAndDelete(createdInvoiceId).catch(() => {});
    }
  });

  describe('POST /api/v1/invoices - Create Invoice', () => {
    it('should create invoice without promo code', async () => {
      const newInvoice = {
        order_id: testOrderId,
        staff_id: testStaffId,
        customer_id: testCustomerId,
        subtotal: 500000,
        tax_rate: 10,
        payment_method: 'cash'
      };

      const response = await request(app)
        .post('/api/v1/invoices')
        .send(newInvoice)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('invoice_number');
      expect(response.body.data.subtotal).toBe(newInvoice.subtotal);
      expect(response.body.data.payment_status).toBe('pending');
      
      createdInvoiceId = response.body.data.id;
    });

    it('should fail when creating invoice for same order', async () => {
      const duplicateInvoice = {
        order_id: testOrderId,
        staff_id: testStaffId,
        subtotal: 300000,
        payment_method: 'card'
      };

      const response = await request(app)
        .post('/api/v1/invoices')
        .send(duplicateInvoice)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/v1/invoices - Get All Invoices', () => {
    it('should return list of all invoices', async () => {
      const response = await request(app)
        .get('/api/v1/invoices')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter invoices by payment status', async () => {
      const response = await request(app)
        .get('/api/v1/invoices?payment_status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter invoices by payment method', async () => {
      const response = await request(app)
        .get('/api/v1/invoices?payment_method=cash')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/invoices/:id - Get Invoice by ID', () => {
    it('should return invoice details with populated data', async () => {
      const response = await request(app)
        .get(`/api/v1/invoices/${createdInvoiceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('order_id');
      expect(response.body.data).toHaveProperty('staff_id');
    });

    it('should fail when invoice not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/invoices/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/invoices/:id/paid - Mark as Paid', () => {
    it('should mark invoice as paid', async () => {
      const response = await request(app)
        .patch(`/api/v1/invoices/${createdInvoiceId}/paid`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment_status).toBe('paid');
      expect(response.body.data).toHaveProperty('paid_at');
    });

    it('should fail when invoice already paid', async () => {
      const response = await request(app)
        .patch(`/api/v1/invoices/${createdInvoiceId}/paid`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already paid');
    });
  });

  describe('GET /api/v1/invoices/statistics - Get Invoice Statistics', () => {
    it('should return invoice statistics', async () => {
      const response = await request(app)
        .get('/api/v1/invoices/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('paid');
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('total_revenue');
    });
  });

  describe('DELETE /api/v1/invoices/:id - Delete Invoice', () => {
    it('should fail to delete paid invoice', async () => {
      const response = await request(app)
        .delete(`/api/v1/invoices/${createdInvoiceId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete paid invoice');
    });
  });
});
