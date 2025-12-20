const OrderDetailService = require('../../../application_layer/orderdetail/orderdetail.service');

class OrderDetailController {
  constructor() {
    this.orderDetailService = new OrderDetailService();
  }

  async getOrderDetails(req, res) {
    try {
      const details = await this.orderDetailService.getOrderDetails(req.params.orderId);

      res.json({
        success: true,
        data: details,
        message: 'Order details retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async addItemToOrder(req, res) {
    try {
      const { dish_id, quantity, unit_price, special_instructions } = req.body;

      if (!dish_id || !quantity || unit_price === undefined) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'dish_id, quantity, and unit_price are required'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'quantity must be greater than 0'
        });
      }

      if (unit_price < 0) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'unit_price cannot be negative'
        });
      }

      const detail = await this.orderDetailService.addItemToOrder(req.params.orderId, {
        dish_id,
        quantity,
        unit_price,
        special_instructions
      });

      res.status(201).json({
        success: true,
        data: detail,
        message: 'Item added to order successfully'
      });
    } catch (error) {
      let statusCode = 400;
      if (error.message === 'Dish not found') {
        statusCode = 404;
      } else if (error.message.includes('already')) {
        statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateOrderItem(req, res) {
    try {
      const { quantity, unit_price, special_instructions, status } = req.body;

      if (quantity === undefined && unit_price === undefined && !special_instructions && !status) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'At least one field is required'
        });
      }

      const detail = await this.orderDetailService.updateOrderItem(
        req.params.orderId,
        req.params.detailId,
        { quantity, unit_price, special_instructions, status }
      );

      res.json({
        success: true,
        data: detail,
        message: 'Order item updated successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async removeOrderItem(req, res) {
    try {
      await this.orderDetailService.removeOrderItem(req.params.orderId, req.params.detailId);

      res.json({
        success: true,
        data: null,
        message: 'Order item removed successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateOrderDetailStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'status is required'
        });
      }

      const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const detail = await this.orderDetailService.updateOrderItem(
        req.params.orderId,
        req.params.detailId,
        { status }
      );

      res.json({
        success: true,
        data: detail,
        message: 'Order detail status updated successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }
}

module.exports = OrderDetailController;
