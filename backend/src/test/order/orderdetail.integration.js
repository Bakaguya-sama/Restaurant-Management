const request = require('supertest');
const app = require('../../../server');
const connectDB = require('../../../config/database');
const { Order, OrderDetail, Dish } = require('../../models');
const mongoose = require('mongoose');

describe('OrderDetail Integration Tests', () => {
  let createdOrderId;
  let dishIds = [];

  beforeAll(async () => {
    await connectDB();

    const order = new Order({
      order_number: `ORD-${Date.now()}`,
      order_type: 'takeaway-customer',
      order_time: '19:30',
      status: 'pending'
    });
    const savedOrder = await order.save();
    createdOrderId = savedOrder._id.toString();

    const dishNames = ['Pasta', 'Steak', 'Salad'];
    for (const name of dishNames) {
      const dish = new Dish({
        name: `${name} ${Date.now()}`,
        description: `Test ${name}`,
        category: 'main_course',
        price: 150000
      });
      const savedDish = await dish.save();
      dishIds.push(savedDish._id.toString());
    }
  });

  afterAll(async () => {
    if (createdOrderId) {
      await Order.findByIdAndDelete(createdOrderId);
      await OrderDetail.deleteMany({ order_id: createdOrderId });
    }
    for (const dishId of dishIds) {
      await Dish.findByIdAndDelete(dishId);
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await OrderDetail.deleteMany({ order_id: createdOrderId });
  });

  describe('GET /api/v1/orders/:orderId/details - Get Order Details', () => {
    it('should retrieve order details successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${createdOrderId}/details`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/orders/:orderId/details - Add Item to Order', () => {
    it('should add item to order successfully', async () => {
      const newItem = {
        dish_id: dishIds[0],
        quantity: 2,
        unit_price: 150000,
        special_instructions: 'Well done'
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(newItem)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.dish_id).toBe(newItem.dish_id);
      expect(response.body.data.quantity).toBe(newItem.quantity);
      expect(response.body.data.unit_price).toBe(newItem.unit_price);
      expect(response.body.data.line_total).toBe(300000);
      expect(response.body.data.special_instructions).toBe(newItem.special_instructions);
      expect(response.body.data.status).toBe('pending');
    });

    it('should fail when adding item without dish_id', async () => {
      const invalidItem = {
        quantity: 2,
        unit_price: 150000
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(invalidItem)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when adding item without quantity', async () => {
      const invalidItem = {
        dish_id: dishIds[0],
        unit_price: 150000
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(invalidItem)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when adding item without unit_price', async () => {
      const invalidItem = {
        dish_id: dishIds[0],
        quantity: 2
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(invalidItem)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when quantity is not greater than 0', async () => {
      const invalidItem = {
        dish_id: dishIds[0],
        quantity: 0,
        unit_price: 150000
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(invalidItem)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when unit_price is negative', async () => {
      const invalidItem = {
        dish_id: dishIds[0],
        quantity: 2,
        unit_price: -100
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(invalidItem)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('unit_price cannot be negative');
    });

    it('should fail when adding non-existent dish', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const invalidItem = {
        dish_id: fakeId.toString(),
        quantity: 2,
        unit_price: 150000
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(invalidItem)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Dish not found');
    });

    it('should fail when adding same dish twice', async () => {
      const item = {
        dish_id: dishIds[0],
        quantity: 2,
        unit_price: 150000
      };

      await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(item)
        .expect(201);

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(item)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already');
    });
  });

  describe('PUT /api/v1/orders/:orderId/details/:detailId - Update Order Item', () => {
    let detailId;

    beforeEach(async () => {
      const newItem = {
        dish_id: dishIds[1],
        quantity: 1,
        unit_price: 200000
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(newItem);

      detailId = response.body.data.id;
    });

    it('should update item quantity successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}/details/${detailId}`)
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(3);
      expect(response.body.data.line_total).toBe(600000);
    });

    it('should update item unit_price successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}/details/${detailId}`)
        .send({ unit_price: 220000 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unit_price).toBe(220000);
      expect(response.body.data.line_total).toBe(220000);
    });

    it('should update item special_instructions successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}/details/${detailId}`)
        .send({ special_instructions: 'No onion' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.special_instructions).toBe('No onion');
    });

    it('should update item status successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}/details/${detailId}`)
        .send({ status: 'preparing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('preparing');
    });

    it('should update multiple fields successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}/details/${detailId}`)
        .send({
          quantity: 2,
          unit_price: 210000,
          special_instructions: 'Less salt'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(2);
      expect(response.body.data.unit_price).toBe(210000);
      expect(response.body.data.line_total).toBe(420000);
      expect(response.body.data.special_instructions).toBe('Less salt');
    });

    it('should fail when no data provided', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}/details/${detailId}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('At least one field is required');
    });

    it('should fail when detail not found in order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/v1/orders/${createdOrderId}/details/${fakeId}`)
        .send({ quantity: 5 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/orders/:orderId/details/:detailId/status - Patch Order Detail Status', () => {
    let detailId;

    beforeEach(async () => {
      const newItem = {
        dish_id: dishIds[0],
        quantity: 1,
        unit_price: 200000
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(newItem);

      detailId = response.body.data.id;
    });

    it('should update item status to preparing with PATCH', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/details/${detailId}/status`)
        .send({ status: 'preparing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('preparing');
    });

    it('should update item status to ready', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/details/${detailId}/status`)
        .send({ status: 'ready' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ready');
    });

    it('should update item status to served', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/details/${detailId}/status`)
        .send({ status: 'served' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('served');
    });

    it('should update item status to cancelled', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/details/${detailId}/status`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should return 404 when detail not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/details/${fakeId}/status`)
        .send({ status: 'ready' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when no status provided', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/details/${detailId}/status`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/details/${detailId}/status`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/orders/:orderId/details/:detailId - Remove Item from Order', () => {
    let detailId;

    beforeEach(async () => {
      const newItem = {
        dish_id: dishIds[2],
        quantity: 1,
        unit_price: 180000
      };

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/details`)
        .send(newItem);

      detailId = response.body.data.id;
    });

    it('should remove item from order successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/orders/${createdOrderId}/details/${detailId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed successfully');
    });

    it('should fail when detail not found in order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/orders/${createdOrderId}/details/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
