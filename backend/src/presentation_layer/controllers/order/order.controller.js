const OrderService = require('../../../application_layer/order/order.service');
const OrderDetailController = require('../orderdetail/orderdetail.controller');

class OrderController {
  constructor() {
    this.orderService = new OrderService();
    this.orderDetailController = new OrderDetailController();
  }

  async getAllOrders(req, res) {
    try {
      const { status, order_type, customer_id, table_id, staff_id } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (order_type) filters.order_type = order_type;
      if (customer_id) filters.customer_id = customer_id;
      if (table_id) filters.table_id = table_id;
      if (staff_id) filters.staff_id = staff_id;

      const orders = await this.orderService.getAllOrders(filters);
      const formattedOrders = orders.map(order => this.orderService.formatOrderResponse(order));

      res.json({
        success: true,
        data: formattedOrders,
        message: 'Orders retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      const formatted = this.orderService.formatOrderResponse(order);

      res.json({
        success: true,
        data: formatted,
        message: 'Order retrieved successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async createOrder(req, res) {
    try {
      const { order_number, order_type, order_time, table_id, customer_id, staff_id, notes } = req.body;

      if (!order_number || !order_type || !order_time) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'order_number, order_type, and order_time are required'
        });
      }

      const orderData = {
        order_number,
        order_type,
        order_time,
        status: 'pending',
        subtotal: 0,
        tax: 0,
        total_amount: 0,
        notes,
        table_id,
        customer_id,
        staff_id
      };

      const order = await this.orderService.createOrder(orderData);
      const formatted = this.orderService.formatOrderResponse(order);

      res.status(201).json({
        success: true,
        data: formatted,
        message: 'Order created successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateOrder(req, res) {
    try {
      const { status, subtotal, tax, total_amount, notes } = req.body;

      const updateData = {};
      if (status !== undefined) updateData.status = status;
      if (subtotal !== undefined) updateData.subtotal = subtotal;
      if (tax !== undefined) updateData.tax = tax;
      if (total_amount !== undefined) updateData.total_amount = total_amount;
      if (notes !== undefined) updateData.notes = notes;

      const updated = await this.orderService.updateOrder(req.params.id, updateData);
      const formatted = this.orderService.formatOrderResponse(updated);

      res.json({
        success: true,
        data: formatted,
        message: 'Order updated successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Order not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async deleteOrder(req, res) {
    try {
      await this.orderService.deleteOrder(req.params.id);

      res.json({
        success: true,
        data: null,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getOrdersByTableId(req, res) {
    try {
      const order = await this.orderService.getOrdersByTableId(req.params.tableId);

      res.json({
        success: true,
        data: order ? this.orderService.formatOrderResponse(order) : null,
        message: 'Order retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getOrdersByCustomerId(req, res) {
    try {
      const orders = await this.orderService.getOrdersByCustomerId(req.params.customerId);
      const formatted = orders.map(order => this.orderService.formatOrderResponse(order));

      res.json({
        success: true,
        data: formatted,
        message: 'Orders retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getOrderStatistics(req, res) {
    try {
      const { date_from, date_to } = req.query;
      const filters = {};

      if (date_from && date_to) {
        filters.date_from = date_from;
        filters.date_to = date_to;
      }

      const statistics = await this.orderService.getOrderStatistics(filters);

      res.json({
        success: true,
        data: statistics,
        message: 'Order statistics retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getOrderDetails(req, res) {
    return this.orderDetailController.getOrderDetails(req, res);
  }

  async addItemToOrder(req, res) {
    return this.orderDetailController.addItemToOrder(req, res);
  }

  async updateOrderItem(req, res) {
    return this.orderDetailController.updateOrderItem(req, res);
  }

  async removeOrderItem(req, res) {
    return this.orderDetailController.removeOrderItem(req, res);
  }

  async calculateOrderTotal(req, res) {
    try {
      const total = await this.orderService.calculateOrderTotal(req.params.id);

      res.json({
        success: true,
        data: total,
        message: 'Order total calculated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }
}

module.exports = OrderController;
