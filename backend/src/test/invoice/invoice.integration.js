const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const mongoose = require('mongoose');
const { Invoice, Order, User, StaffCashier, Customer, Promotion } = require('../../models');

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
        membership_level: 'silver',
        points: 500
      });
    } else if (customer.points < 500) {
      // Ensure test customer has enough points
      customer = await Customer.findByIdAndUpdate(
        customer._id,
        { points: 500 },
        { new: true }
      );
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
        payment_method: 'cash',
        points_used: 100,
        points_earned: 50
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
      expect(response.body.data.points_used).toBe(100);
      expect(response.body.data.points_earned).toBe(50);
      
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

    it('should fail when customer lacks sufficient points to redeem', async () => {
      const invoiceWithExcessivePoints = {
        order_id: testOrderId,
        staff_id: testStaffId,
        customer_id: testCustomerId,
        subtotal: 500000,
        tax_rate: 10,
        payment_method: 'cash',
        points_used: 999999
      };

      const response = await request(app)
        .post('/api/v1/invoices')
        .send(invoiceWithExcessivePoints)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('points');
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
    it('should mark invoice as paid and apply points', async () => {
      const response = await request(app)
        .patch(`/api/v1/invoices/${createdInvoiceId}/paid`)
        .send({ payment_method: 'card' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment_status).toBe('paid');
      expect(response.body.data.payment_method).toBe('card');
      expect(response.body.data).toHaveProperty('paid_at');
      // Points should be present in the response
      expect(response.body.data).toHaveProperty('points_used');
      expect(response.body.data).toHaveProperty('points_earned');
    });

    it('should mark invoice as paid with promotion', async () => {
      // Create new invoice using different order  
      const tempOrder = await Order.create({
        customer_id: testCustomerId,
        staff_id: testStaffId,
        order_number: `PROMO${Date.now()}`,
        order_date: new Date(),
        order_time: '14:00',
        status: 'completed',
        total_amount: 500000
      });

      const newInvoice = {
        order_id: tempOrder._id,
        staff_id: testStaffId,
        customer_id: testCustomerId,
        subtotal: 500000,
        tax_rate: 10,
        payment_method: 'cash'
      };

      const createResponse = await request(app)
        .post('/api/v1/invoices')
        .send(newInvoice)
        .expect(201);

      const invoiceId = createResponse.body.data.id;

      // Get available promotions
      const promotionsResponse = await request(app)
        .get('/api/v1/promotions?is_active=true')
        .expect(200);

      if (promotionsResponse.body.data && promotionsResponse.body.data.length > 0) {
        const promotion = promotionsResponse.body.data[0];
        
        const response = await request(app)
          .patch(`/api/v1/invoices/${invoiceId}/paid`)
          .send({ 
            payment_method: 'card',
            promotion_id: promotion.id 
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.payment_status).toBe('paid');
        expect(response.body.data.discount_amount).toBeGreaterThan(0);
      }

      // Cleanup
      await Invoice.findByIdAndDelete(invoiceId);
      await Order.findByIdAndDelete(tempOrder._id);
    });

    it('should increment promotion usage count when applied', async () => {
      // Create a limited promotion
      const limitedPromotion = await Promotion.create({
        promo_code: `LIMITED${Date.now()}`,
        name: 'Limited Test Promotion',
        promotion_type: 'percentage',
        discount_value: 10,
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minimum_order_amount: 100000,
        max_uses: 5,
        current_uses: 0,
        is_active: true
      });

      const initialUses = limitedPromotion.current_uses;

      // Create invoice and order
      const tempOrder = await Order.create({
        customer_id: testCustomerId,
        staff_id: testStaffId,
        order_number: `LIMIT${Date.now()}`,
        order_date: new Date(),
        order_time: '15:00',
        status: 'completed',
        total_amount: 500000
      });

      const newInvoice = {
        order_id: tempOrder._id,
        staff_id: testStaffId,
        customer_id: testCustomerId,
        subtotal: 500000,
        tax_rate: 10,
        payment_method: 'cash'
      };

      const createResponse = await request(app)
        .post('/api/v1/invoices')
        .send(newInvoice)
        .expect(201);

      const invoiceId = createResponse.body.data.id;

      // Apply promotion and mark as paid
      await request(app)
        .patch(`/api/v1/invoices/${invoiceId}/paid`)
        .send({ 
          payment_method: 'card',
          promotion_id: limitedPromotion._id.toString()
        })
        .expect(200);

      // Check promotion usage count increased
      const updatedPromotion = await Promotion.findById(limitedPromotion._id);
      expect(updatedPromotion.current_uses).toBe(initialUses + 1);

      // Cleanup
      await Invoice.findByIdAndDelete(invoiceId);
      await Order.findByIdAndDelete(tempOrder._id);
      await Promotion.findByIdAndDelete(limitedPromotion._id);
    });

    it('should fail when promotion reaches max uses', async () => {
      // Create a promotion with max uses reached
      const maxedPromotion = await Promotion.create({
        promo_code: `MAXED${Date.now()}`,
        name: 'Maxed Test Promotion',
        promotion_type: 'fixed_amount',
        discount_value: 50000,
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minimum_order_amount: 100000,
        max_uses: 3,
        current_uses: 3, // Already at max
        is_active: true
      });

      // Create invoice and order
      const tempOrder = await Order.create({
        customer_id: testCustomerId,
        staff_id: testStaffId,
        order_number: `MAXTEST${Date.now()}`,
        order_date: new Date(),
        order_time: '16:00',
        status: 'completed',
        total_amount: 500000
      });

      const newInvoice = {
        order_id: tempOrder._id,
        staff_id: testStaffId,
        customer_id: testCustomerId,
        subtotal: 500000,
        tax_rate: 10,
        payment_method: 'cash'
      };

      const createResponse = await request(app)
        .post('/api/v1/invoices')
        .send(newInvoice)
        .expect(201);

      const invoiceId = createResponse.body.data.id;

      // Try to apply maxed out promotion
      const response = await request(app)
        .patch(`/api/v1/invoices/${invoiceId}/paid`)
        .send({ 
          payment_method: 'card',
          promotion_id: maxedPromotion._id.toString()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('maximum uses');

      // Cleanup
      await Invoice.findByIdAndDelete(invoiceId);
      await Order.findByIdAndDelete(tempOrder._id);
      await Promotion.findByIdAndDelete(maxedPromotion._id);
    });

    it('should allow unlimited promotions (max_uses = -1)', async () => {
      // Create unlimited promotion
      const unlimitedPromotion = await Promotion.create({
        promo_code: `UNLIMITED${Date.now()}`,
        name: 'Unlimited Test Promotion',
        promotion_type: 'percentage',
        discount_value: 5,
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        minimum_order_amount: 100000,
        max_uses: -1, // Unlimited
        current_uses: 999, // High usage count
        is_active: true
      });

      // Create invoice and order
      const tempOrder = await Order.create({
        customer_id: testCustomerId,
        staff_id: testStaffId,
        order_number: `UNLIM${Date.now()}`,
        order_date: new Date(),
        order_time: '17:00',
        status: 'completed',
        total_amount: 500000
      });

      const newInvoice = {
        order_id: tempOrder._id,
        staff_id: testStaffId,
        customer_id: testCustomerId,
        subtotal: 500000,
        tax_rate: 10,
        payment_method: 'cash'
      };

      const createResponse = await request(app)
        .post('/api/v1/invoices')
        .send(newInvoice)
        .expect(201);

      const invoiceId = createResponse.body.data.id;

      // Apply unlimited promotion - should succeed
      const response = await request(app)
        .patch(`/api/v1/invoices/${invoiceId}/paid`)
        .send({ 
          payment_method: 'card',
          promotion_id: unlimitedPromotion._id.toString()
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment_status).toBe('paid');

      // Verify usage count still incremented
      const updatedPromotion = await Promotion.findById(unlimitedPromotion._id);
      expect(updatedPromotion.current_uses).toBe(1000);

      // Cleanup
      await Invoice.findByIdAndDelete(invoiceId);
      await Order.findByIdAndDelete(tempOrder._id);
      await Promotion.findByIdAndDelete(unlimitedPromotion._id);
    });

    it('should fail when invoice already paid', async () => {
      const response = await request(app)
        .patch(`/api/v1/invoices/${createdInvoiceId}/paid`)
        .send({ payment_method: 'cash' })
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
