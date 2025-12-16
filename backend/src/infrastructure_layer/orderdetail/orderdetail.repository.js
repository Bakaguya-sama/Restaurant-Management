const { OrderDetail } = require('../../models');

class OrderDetailRepository {
  async findByOrderId(orderId) {
    return await OrderDetail.find({ order_id: orderId }).sort({ created_at: 1 });
  }

  async findById(id) {
    return await OrderDetail.findById(id);
  }

  async findByOrderIdAndDishId(orderId, dishId) {
    return await OrderDetail.findOne({ order_id: orderId, dish_id: dishId });
  }

  async create(data) {
    const orderDetail = new OrderDetail({
      order_id: data.order_id,
      dish_id: data.dish_id,
      quantity: data.quantity,
      unit_price: data.unit_price,
      line_total: data.line_total,
      special_instructions: data.special_instructions,
      status: data.status || 'pending'
    });

    return await orderDetail.save();
  }

  async update(id, data) {
    const updateData = {};

    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.unit_price !== undefined) updateData.unit_price = data.unit_price;
    if (data.line_total !== undefined) updateData.line_total = data.line_total;
    if (data.special_instructions !== undefined) updateData.special_instructions = data.special_instructions;
    if (data.status !== undefined) updateData.status = data.status;

    return await OrderDetail.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await OrderDetail.findByIdAndDelete(id);
  }

  async deleteByOrderId(orderId) {
    return await OrderDetail.deleteMany({ order_id: orderId });
  }

  async updateStatusByOrderId(orderId, status) {
    return await OrderDetail.updateMany({ order_id: orderId }, { status });
  }
}

module.exports = OrderDetailRepository;
