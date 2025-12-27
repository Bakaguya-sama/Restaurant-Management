  const { ReservationDetail } = require('../../models');

  class ReservationDetailRepository {
  async findAll(filters = {}) {
    const query = {};
    if (filters.reservation_id) {
      query.reservation_id = filters.reservation_id;
    }
    if (filters.table_id) {
      query.table_id = filters.table_id;
    }
    return await ReservationDetail.find(query);
  }

  async findById(id) {
    return await ReservationDetail.findById(id);
  }

  async findByTableAndTime(table_id, reservation_date, reservation_time) {
    const { Reservation } = require('../../models');
    const reservations = await Reservation.find({
      reservation_date,
      reservation_time
    });
    
    for (const reservation of reservations) {
      const detail = await ReservationDetail.findOne({
        table_id,
        reservation_id: reservation._id
      });
      if (detail) return detail;
    }
    return null;
  }

  async findByTableAndDate(table_id, reservation_date) {
    const details = await ReservationDetail.find({ table_id });
    const { Reservation } = require('../../models');
    
    const filtered = [];
    for (const detail of details) {
      const reservation = await Reservation.findById(detail.reservation_id);
      if (reservation && reservation.reservation_date.toDateString() === new Date(reservation_date).toDateString()) {
        filtered.push(detail);
      }
    }
    return filtered;
  }

  async create(data) {
    const detail = new ReservationDetail(data);
    return await detail.save();
  }

  async update(id, data) {
    return await ReservationDetail.findByIdAndUpdate(id, data, { new: true });
  }


  async delete(id) {
    return await ReservationDetail.findByIdAndDelete(id);
  }

  async findByReservationIdAndTableId(reservation_id, table_id) {
    return await ReservationDetail.findOne({ reservation_id, table_id });
  }

  async deleteByReservationId(reservation_id) {
    return await ReservationDetail.deleteMany({ reservation_id });
  }

  async findByReservationId(reservation_id) {
    return await ReservationDetail.find({ reservation_id });
  }

  async addTableToReservation(reservation_id, table_id) {
    const detail = new ReservationDetail({ reservation_id, table_id });
    return await detail.save();
  }

  async removeTableFromReservation(reservation_id, table_id) {
    return await ReservationDetail.deleteOne({ reservation_id, table_id });
  }
}

module.exports = ReservationDetailRepository;
