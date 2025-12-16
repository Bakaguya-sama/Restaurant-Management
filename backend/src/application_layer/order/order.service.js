const OrderRepository = require('../../infrastructure_layer/order/order.repository');
const OrderDetailRepository = require('../../infrastructure_layer/orderdetail/orderdetail.repository');
const OrderDetailService = require('../../application_layer/orderdetail/orderdetail.service');
const OrderEntity = require('../../domain_layer/order/order.entity');
const { Table, Customer, Staff, Order } = require('../../models');

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderDetailRepository = new OrderDetailRepository();
    this.orderDetailService = new OrderDetailService();
  }

  async getAllOrders(filters = {}) {
    return await this.orderRepository.findAll(filters);
  }

  async getOrderById(id) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async createOrder(orderData) {
    const orderEntity = new OrderEntity(orderData);
    const validation = orderEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingOrder = await this.orderRepository.findByOrderNumber(orderData.order_number);
    if (existingOrder) {
      throw new Error('Order with this order_number already exists');
    }

    const orderType = orderData.order_type;
    if (orderType === 'dine-in-customer' || orderType === 'dine-in-waiter') {
      if (!orderData.table_id) {
        throw new Error('table_id is required for dine-in orders');
      }
      const table = await Table.findById(orderData.table_id);
      if (!table) {
        throw new Error('Table not found');
      }
    }

    if (orderType === 'dine-in-customer' || orderType === 'takeaway-customer') {
      if (!orderData.customer_id) {
        throw new Error('customer_id is required for customer orders');
      }
      const customer = await Customer.findById(orderData.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }
    }

    if (orderType === 'dine-in-waiter' || orderType === 'takeaway-staff') {
      if (!orderData.staff_id) {
        throw new Error('staff_id is required for staff orders');
      }
      const staff = await Staff.findById(orderData.staff_id);
      if (!staff) {
        throw new Error('Staff not found');
      }
    }

    return await this.orderRepository.create(orderData);
  }

  async updateOrder(id, updateData) {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      throw new Error('Invalid status');
    }

    if (updateData.subtotal !== undefined && updateData.subtotal < 0) {
      throw new Error('subtotal cannot be negative');
    }

    if (updateData.tax !== undefined && updateData.tax < 0) {
      throw new Error('tax cannot be negative');
    }

    if (updateData.total_amount !== undefined && updateData.total_amount < 0) {
      throw new Error('total_amount cannot be negative');
    }

    return await this.orderRepository.update(id, updateData);
  }

  async deleteOrder(id) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    await this.orderDetailRepository.deleteByOrderId(id);
    return await this.orderRepository.delete(id);
  }

  async getOrdersByTableId(tableId) {
    return await this.orderRepository.findByTableId(tableId);
  }

  async getOrdersByCustomerId(customerId) {
    return await this.orderRepository.findByCustomerId(customerId);
  }

  async getOrderStatistics(filters = {}) {
    return await this.orderRepository.getOrderStatistics(filters);
  }

  async getOrderDetails(orderId) {
    return await this.orderDetailService.getOrderDetails(orderId);
  }

  async addItemToOrder(orderId, itemData) {
    return await this.orderDetailService.addItemToOrder(orderId, itemData);
  }

  async updateOrderItem(orderId, detailId, updateData) {
    return await this.orderDetailService.updateOrderItem(orderId, detailId, updateData);
  }

  async removeOrderItem(orderId, detailId) {
    return await this.orderDetailService.removeOrderItem(orderId, detailId);
  }

  async calculateOrderTotal(orderId) {
    const orderDetails = await this.orderDetailRepository.findByOrderId(orderId);
    const subtotal = orderDetails.reduce((sum, detail) => sum + detail.line_total, 0);
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    await this.orderRepository.update(orderId, {
      subtotal,
      tax,
      total_amount: totalAmount
    });

    return { subtotal, tax, total_amount: totalAmount };
  }

  formatOrderResponse(order) {
    const entity = new OrderEntity(order);
    return entity.formatResponse();
  }
}

module.exports = OrderService;
