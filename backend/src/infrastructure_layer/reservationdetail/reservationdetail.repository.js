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

  async findByTableAndTime(table_id, reservation_date, reservation_time, reservation_checkout_time = null) {
    const { Reservation } = require('../../models');
    
    let dateStr = reservation_date;
    if (reservation_date instanceof Date) {
      const year = reservation_date.getFullYear();
      const month = String(reservation_date.getMonth() + 1).padStart(2, '0');
      const day = String(reservation_date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    const [newYear, newMonth, newDay] = dateStr.split('-').map(Number);
    const [newHour, newMinute] = reservation_time.split(':').map(Number);
    const newStart = new Date(newYear, newMonth - 1, newDay, newHour, newMinute);
    
    let newEnd = newStart;
    if (reservation_checkout_time) {
      const [checkoutHour, checkoutMinute] = reservation_checkout_time.split(':').map(Number);
      newEnd = new Date(newYear, newMonth - 1, newDay, checkoutHour, checkoutMinute);
    }

    const allReservationDetails = await ReservationDetail.find({ table_id });

    for (const detail of allReservationDetails) {
      const reservation = await Reservation.findById(detail.reservation_id);
      if (!reservation) continue;

      let existingDateStr = reservation.reservation_date;
      if (reservation.reservation_date instanceof Date) {
        const year = reservation.reservation_date.getFullYear();
        const month = String(reservation.reservation_date.getMonth() + 1).padStart(2, '0');
        const day = String(reservation.reservation_date.getDate()).padStart(2, '0');
        existingDateStr = `${year}-${month}-${day}`;
      }

      if (existingDateStr !== dateStr) continue;

      const [existingHour, existingMinute] = reservation.reservation_time.split(':').map(Number);
      const existingStart = new Date(newYear, newMonth - 1, newDay, existingHour, existingMinute);
      
      const [checkoutHour, checkoutMinute] = reservation.reservation_checkout_time.split(':').map(Number);
      const existingEnd = new Date(newYear, newMonth - 1, newDay, checkoutHour, checkoutMinute);

      if (newStart < existingEnd && newEnd > existingStart) {
        return detail;
      }
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
