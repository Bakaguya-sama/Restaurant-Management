const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Order, OrderDetail, Table, User, Customer, StaffWaiter, Dish } = require('../../models');
const mongoose = require('mongoose');

describe('Order Integration Tests', () => {
  let createdOrderId;
  let tableId;
  let customerId;
  let staffId;
  let dishId;

  beforeAll(async () => {
    await connectDB();

    const table = new Table({
      table_number: `TABLE-${Date.now()}`,
      capacity: 4,
      status: 'free'
    });
    const savedTable = await table.save();
    tableId = savedTable._id.toString();

    const customer = new Customer({
      full_name: `Customer ${Date.now()}`,
      email: `customer${Date.now()}@test.com`,
      phone: '0123456789',
      password_hash: 'hashed_password',
      role: 'customer',
      username: `testcust${Date.now()}`,
      is_active: true
    });
    const savedCustomer = await customer.save();
    customerId = savedCustomer._id.toString();

    const staff = new StaffWaiter({
      full_name: `Waiter ${Date.now()}`,
      email: `waiter${Date.now()}@test.com`,
      phone: '0987654321',
      role: 'waiter',
      username: `waiter${Date.now()}`,
      password_hash: 'hashed_password',
      is_active: true
    });
    const savedStaff = await staff.save();
    staffId = savedStaff._id.toString();

    const dish = new Dish({
      name: `Dish ${Date.now()}`,
      description: 'Test dish',
      category: 'main_course',
      price: 150000
    });
    const savedDish = await dish.save();
    dishId = savedDish._id.toString();
  });

  afterAll(async () => {
    if (createdOrderId) {
      await Order.findByIdAndDelete(createdOrderId);
      await OrderDetail.deleteMany({ order_id: createdOrderId });
    }
    if (tableId) {
      await Table.findByIdAndDelete(tableId);
    }
    if (customerId) {
      await User.findByIdAndDelete(customerId);
    }
    if (staffId) {
      await User.findByIdAndDelete(staffId);
    }
    if (dishId) {
      await Dish.findByIdAndDelete(dishId);
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await OrderDetail.deleteMany({ order_id: createdOrderId });
  });

  describe('POST /api/v1/orders - Create Order', () => {
    it('should create a dine-in order by customer successfully', async () => {
      const newOrder = {
        order_number: `ORD-${Date.now()}`,
        order_type: 'dine-in-customer',
        order_time: '19:30',
        table_id: tableId,
        customer_id: customerId,
        notes: 'No spice'
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.order_number).toBe(newOrder.order_number);
      expect(response.body.data.order_type).toBe(newOrder.order_type);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.subtotal).toBe(0);
      expect(response.body.data.total_amount).toBe(0);

      createdOrderId = response.body.data.id;
    });

    it('should create a takeaway order by customer successfully', async () => {
      const newOrder = {
        order_number: `ORD-TAK-${Date.now()}`,
        order_type: 'takeaway-customer',
        order_time: '18:00',
        customer_id: customerId
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order_type).toBe('takeaway-customer');

      if (!createdOrderId) {
        createdOrderId = response.body.data.id;
      }
    });

    it('should create a dine-in order by waiter successfully', async () => {
      const newOrder = {
        order_number: `ORD-WAIT-${Date.now()}`,
        order_type: 'dine-in-waiter',
        order_time: '20:15',
        table_id: tableId,
        staff_id: staffId
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order_type).toBe('dine-in-waiter');

      if (!createdOrderId) {
        createdOrderId = response.body.data.id;
      }
    });

    it('should fail when creating order without order_number', async () => {
      const invalidOrder = {
        order_type: 'dine-in-customer',
        order_time: '19:30',
        table_id: tableId,
        customer_id: customerId
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when creating order without order_type', async () => {
      const invalidOrder = {
        order_number: `ORD-${Date.now()}`,
        order_time: '19:30',
        table_id: tableId,
        customer_id: customerId
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when creating order without order_time', async () => {
      const invalidOrder = {
        order_number: `ORD-${Date.now()}`,
        order_type: 'dine-in-customer',
        table_id: tableId,
        customer_id: customerId
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid order_type', async () => {
      const invalidOrder = {
        order_number: `ORD-${Date.now()}`,
        order_type: 'invalid-type',
        order_time: '19:30',
        table_id: tableId,
        customer_id: customerId
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('order_type');
    });

    it('should fail with duplicate order_number', async () => {
      const duplicateOrder = {
        order_number: `ORD-${Date.now()}`,
        order_type: 'dine-in-customer',
        order_time: '19:30',
        table_id: tableId,
        customer_id: customerId
      };

      await request(app)
        .post('/api/v1/orders')
        .send(duplicateOrder)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/orders')
        .send(duplicateOrder)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should fail when table_id not found for dine-in order', async () => {
      const fakeTableId = new mongoose.Types.ObjectId();
      const invalidOrder = {
        order_number: `ORD-${Date.now()}`,
        order_type: 'dine-in-customer',
        order_time: '19:30',
        table_id: fakeTableId.toString(),
        customer_id: customerId
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Table not found');
    });

    it('should fail when customer_id not found', async () => {
      const fakeCustomerId = new mongoose.Types.ObjectId();
      const invalidOrder = {
        order_number: `ORD-${Date.now()}`,
        order_type: 'dine-in-customer',
        order_time: '19:30',
        table_id: tableId,
        customer_id: fakeCustomerId.toString()
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Customer not found');
    });

    it('should fail when staff_id not found for waiter order', async () => {
      const fakeStaffId = new mongoose.Types.ObjectId();
      const invalidOrder = {
        order_number: `ORD-${Date.now()}`,
        order_type: 'dine-in-waiter',
        order_time: '20:15',
        table_id: tableId,
        staff_id: fakeStaffId.toString()
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Staff not found');
    });
  });

  describe('GET /api/v1/orders - Get All Orders', () => {
    it('should retrieve all orders successfully', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/orders?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter orders by order_type', async () => {
      const response = await request(app)
        .get('/api/v1/orders?order_type=dine-in-customer')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter orders by customer_id', async () => {
      const response = await request(app)
        .get(`/api/v1/orders?customer_id=${customerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/orders/:id - Get Order by ID', () => {
    it('should retrieve order by ID successfully', async () => {
      if (!createdOrderId) {
        const newOrder = {
          order_number: `ORD-${Date.now()}`,
          order_type: 'dine-in-customer',
          order_time: '19:30',
          table_id: tableId,
          customer_id: customerId
        };

        const createResponse = await request(app)
          .post('/api/v1/orders')
          .send(newOrder);

        createdOrderId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/orders/${createdOrderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdOrderId);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/orders/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Order not found');
    });
  });

  describe('GET /api/v1/orders/table/:tableId - Get Order by Table', () => {
    it('should retrieve order by table ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/table/${tableId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/orders/customer/:customerId - Get Orders by Customer', () => {
    it('should retrieve orders by customer ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/customer/${customerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/v1/orders/:id - Update Order', () => {
    it('should update order status successfully', async () => {
      if (!createdOrderId) {
        const newOrder = {
          order_number: `ORD-${Date.now()}`,
          order_type: 'dine-in-customer',
          order_time: '19:30',
          table_id: tableId,
          customer_id: customerId
        };

        const createResponse = await request(app)
          .post('/api/v1/orders')
          .send(newOrder);

        createdOrderId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}`)
        .send({ status: 'preparing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('preparing');
    });

    it('should update order notes successfully', async () => {
      if (!createdOrderId) {
        const newOrder = {
          order_number: `ORD-${Date.now()}`,
          order_type: 'dine-in-customer',
          order_time: '19:30',
          table_id: tableId,
          customer_id: customerId
        };

        const createResponse = await request(app)
          .post('/api/v1/orders')
          .send(newOrder);

        createdOrderId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}`)
        .send({ notes: 'Extra napkins' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe('Extra napkins');
    });

    it('should return 404 when updating non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/v1/orders/${fakeId}`)
        .send({ status: 'ready' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/orders/:id/status - Patch Order Status', () => {
    it('should update order status successfully with PATCH', async () => {
      if (!createdOrderId) {
        const newOrder = {
          order_number: `ORD-${Date.now()}`,
          order_type: 'dine-in-customer',
          order_time: '19:30',
          table_id: tableId,
          customer_id: customerId
        };

        const createResponse = await request(app)
          .post('/api/v1/orders')
          .send(newOrder);

        createdOrderId = createResponse.body.data.id;
      }

      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/status`)
        .send({ status: 'ready' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ready');
    });

    it('should update order to served status', async () => {
      if (!createdOrderId) {
        const newOrder = {
          order_number: `ORD-${Date.now()}`,
          order_type: 'dine-in-customer',
          order_time: '19:30',
          table_id: tableId,
          customer_id: customerId
        };

        const createResponse = await request(app)
          .post('/api/v1/orders')
          .send(newOrder);

        createdOrderId = createResponse.body.data.id;
      }

      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/status`)
        .send({ status: 'served' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('served');
    });

    it('should update order to completed status', async () => {
      if (!createdOrderId) {
        const newOrder = {
          order_number: `ORD-${Date.now()}`,
          order_type: 'dine-in-customer',
          order_time: '19:30',
          table_id: tableId,
          customer_id: customerId
        };

        const createResponse = await request(app)
          .post('/api/v1/orders')
          .send(newOrder);

        createdOrderId = createResponse.body.data.id;
      }

      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/status`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should return 404 when patching non-existent order status', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/v1/orders/${fakeId}/status`)
        .send({ status: 'ready' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when no status provided', async () => {
      if (!createdOrderId) {
        const newOrder = {
          order_number: `ORD-${Date.now()}`,
          order_type: 'dine-in-customer',
          order_time: '19:30',
          table_id: tableId,
          customer_id: customerId
        };

        const createResponse = await request(app)
          .post('/api/v1/orders')
          .send(newOrder);

        createdOrderId = createResponse.body.data.id;
      }

      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/status`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/orders/:id/calculate - Calculate Order Total', () => {
    it('should calculate order total successfully', async () => {
      if (!createdOrderId) {
        const newOrder = {
          order_number: `ORD-${Date.now()}`,
          order_type: 'dine-in-customer',
          order_time: '19:30',
          table_id: tableId,
          customer_id: customerId
        };

        const createResponse = await request(app)
          .post('/api/v1/orders')
          .send(newOrder);

        createdOrderId = createResponse.body.data.id;
      }

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/calculate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('subtotal');
      expect(response.body.data).toHaveProperty('tax');
      expect(response.body.data).toHaveProperty('total_amount');
    });
  });

  describe('DELETE /api/v1/orders/:id - Delete Order', () => {
    it('should delete order successfully', async () => {
      const newOrder = {
        order_number: `ORD-DEL-${Date.now()}`,
        order_type: 'dine-in-customer',
        order_time: '19:30',
        table_id: tableId,
        customer_id: customerId
      };

      const createResponse = await request(app)
        .post('/api/v1/orders')
        .send(newOrder);

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/orders/${orderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when deleting non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/orders/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders/statistics - Get Order Statistics', () => {
    it('should retrieve order statistics successfully', async () => {
      const response = await request(app)
        .get('/api/v1/orders/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
