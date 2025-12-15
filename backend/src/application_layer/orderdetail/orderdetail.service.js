const OrderDetailRepository = require('../../infrastructure_layer/orderdetail/orderdetail.repository');
const OrderDetailEntity = require('../../domain_layer/orderdetail/orderdetail.entity');
const { Dish } = require('../../models');

class OrderDetailService {
  constructor() {
    this.orderDetailRepository = new OrderDetailRepository();
  }

  async getOrderDetails(orderId) {
    const details = await this.orderDetailRepository.findByOrderId(orderId);
    return details.map(detail => this.formatOrderDetailResponse(detail));
  }

  async addItemToOrder(orderId, itemData) {
    const dish = await Dish.findById(itemData.dish_id);
    if (!dish) {
      throw new Error('Dish not found');
    }

    const existingItem = await this.orderDetailRepository.findByOrderIdAndDishId(orderId, itemData.dish_id);
    if (existingItem) {
      throw new Error('This dish is already in the order');
    }

    const lineTotal = itemData.quantity * itemData.unit_price;

    const created = await this.orderDetailRepository.create({
      order_id: orderId,
      dish_id: itemData.dish_id,
      quantity: itemData.quantity,
      unit_price: itemData.unit_price,
      line_total: lineTotal,
      special_instructions: itemData.special_instructions,
      status: 'pending'
    });

    return this.formatOrderDetailResponse(created);
  }

  async updateOrderItem(orderId, detailId, updateData) {
    const detail = await this.orderDetailRepository.findById(detailId);
    if (!detail || detail.order_id.toString() !== orderId.toString()) {
      throw new Error('Order detail not found in this order');
    }

    const updatedDetail = { ...detail.toObject(), ...updateData };
    
    if (updateData.quantity && updateData.unit_price) {
      updatedDetail.line_total = updateData.quantity * updateData.unit_price;
    } else if (updateData.quantity) {
      updatedDetail.line_total = updateData.quantity * detail.unit_price;
    } else if (updateData.unit_price) {
      updatedDetail.line_total = detail.quantity * updateData.unit_price;
    }

    const updated = await this.orderDetailRepository.update(detailId, {
      quantity: updateData.quantity,
      unit_price: updateData.unit_price,
      line_total: updatedDetail.line_total,
      special_instructions: updateData.special_instructions,
      status: updateData.status
    });

    return this.formatOrderDetailResponse(updated);
  }

  async removeOrderItem(orderId, detailId) {
    const detail = await this.orderDetailRepository.findById(detailId);
    if (!detail || detail.order_id.toString() !== orderId.toString()) {
      throw new Error('Order detail not found in this order');
    }

    return await this.orderDetailRepository.delete(detailId);
  }

  formatOrderDetailResponse(detail) {
    const entity = new OrderDetailEntity(detail);
    return entity.formatResponse();
  }
}

module.exports = OrderDetailService;
