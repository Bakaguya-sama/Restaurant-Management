const { Reservation } = require('../../models');

class ReservationRepository {
  async findAll(filters = {}) {
    const query = {};
    if (filters.customer_id) {
      query.customer_id = filters.customer_id;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.reservation_date) {
      query.reservation_date = filters.reservation_date;
    }
    return await Reservation.find(query).sort({ created_at: -1 });
  }

  async findByCustomerId(customerId) {
    return await Reservation.find({ customer_id: customerId }).sort({ created_at: -1 });
  }

  async findByTableId(tableId) {
    // Tìm tất cả reservation có tableId trong reservationdetail
    // Sử dụng aggregation để join
    return await Reservation.aggregate([
      {
        $lookup: {
          from: 'reservationdetails',
          localField: '_id',
          foreignField: 'reservation_id',
          as: 'details'
        }
      },
      { $unwind: '$details' },
      { $match: { 'details.table_id': typeof tableId === 'string' ? require('mongoose').Types.ObjectId(tableId) : tableId } },
      { $sort: { created_at: -1 } }
    ]);
  }

  async getStatistics() {
    // Thống kê số lượng reservation theo status
    return await Reservation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
  }


  async findById(id) {
    return await Reservation.findById(id);
  }

  async findByCustomerAndDate(customer_id, reservation_date) {
    return await Reservation.findOne({ customer_id, reservation_date });
  }

  async deleteManyByCustomer(customer_id) {
    return await Reservation.deleteMany({ customer_id });
  }

  async create(data) {
    const reservation = new Reservation(data);
    return await reservation.save();
  }

  async update(id, data) {
    return await Reservation.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Reservation.findByIdAndDelete(id);
  }
}

module.exports = ReservationRepository;
