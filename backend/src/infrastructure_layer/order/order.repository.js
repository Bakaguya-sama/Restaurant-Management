const { Order } = require('../../models');

class OrderRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.order_type) {
      query.order_type = filters.order_type;
    }

    if (filters.customer_id) {
      query.customer_id = filters.customer_id;
    }

    if (filters.table_id) {
      query.table_id = filters.table_id;
    }

    if (filters.staff_id) {
      query.staff_id = filters.staff_id;
    }

    return await Order.find(query).sort({ created_at: -1 });
  }

  async findById(id) {
    return await Order.findById(id);
  }

  async findByOrderNumber(orderNumber) {
    return await Order.findOne({ order_number: orderNumber });
  }

  async create(data) {
    const order = new Order({
      order_number: data.order_number,
      order_type: data.order_type,
      order_time: data.order_time,
      status: data.status || 'pending',
      subtotal: data.subtotal || 0,
      tax: data.tax || 0,
      total_amount: data.total_amount || 0,
      notes: data.notes,
      table_id: data.table_id,
      customer_id: data.customer_id,
      staff_id: data.staff_id
    });

    return await order.save();
  }

  async update(id, data) {
    const updateData = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
    if (data.tax !== undefined) updateData.tax = data.tax;
    if (data.total_amount !== undefined) updateData.total_amount = data.total_amount;
    if (data.notes !== undefined) updateData.notes = data.notes;

    updateData.updated_at = new Date();

    return await Order.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Order.findByIdAndDelete(id);
  }

  async findByTableId(tableId) {
    return await Order.findOne({ table_id: tableId, status: { $in: ['pending', 'preparing', 'ready', 'served'] } });
  }

  async findByCustomerId(customerId) {
    return await Order.find({ customer_id: customerId }).sort({ created_at: -1 });
  }

  async getOrderStatistics(filters = {}) {
    const matchStage = {};
    
    if (filters.date_from && filters.date_to) {
      matchStage.order_date = {
        $gte: new Date(filters.date_from),
        $lte: new Date(filters.date_to)
      };
    }

    return await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total_amount' }
        }
      }
    ]);
  }
}

module.exports = OrderRepository;
