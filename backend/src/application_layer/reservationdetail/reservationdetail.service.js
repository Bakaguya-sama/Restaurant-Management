
const ReservationDetailRepository = require('../../infrastructure_layer/reservationdetail/reservationdetail.repository');
const TableRepository = require('../../infrastructure_layer/table/table.repository');
const ReservationDetailEntity = require('../../domain_layer/reservationdetail/reservationdetail.entity');
const { Reservation } = require('../../models');


class ReservationDetailService {
  constructor() {
    this.reservationDetailRepository = new ReservationDetailRepository();
    this.tableRepository = new TableRepository();
  }

  async getAllReservationDetails(filters = {}) {
    const details = await this.reservationDetailRepository.findAll(filters);
    return details.map(d => this.formatReservationDetailResponse(d));
  }

  async getReservationDetailById(id) {
    const detail = await this.reservationDetailRepository.findById(id);
    if (!detail) {
      throw new Error('ReservationDetail not found');
    }
    return this.formatReservationDetailResponse(detail);
  }


  async createReservationDetail(data) {
    const entity = new ReservationDetailEntity(data);
    const validation = entity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    const reservation = await Reservation.findById(data.reservation_id);
    if (!reservation) throw new Error('Reservation not found');
    const table = await this.tableRepository.findById(data.table_id);
    if (!table) throw new Error('Table not found');
    if (reservation.number_of_guests > table.capacity) {
      throw new Error('Number of guests exceeds table capacity');
    }
    const conflict = await this.reservationDetailRepository.findByTableAndTime(
      data.table_id,
      reservation.reservation_date,
      reservation.reservation_time
    );
    if (conflict) {
      throw new Error('Table is already reserved for this time slot');
    }
    const detail = await this.reservationDetailRepository.create({
      ...data,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time
    });
    await this.tableRepository.updateStatus(data.table_id, 'reserved');
    return this.formatReservationDetailResponse(detail);
  }

  async updateReservationDetail(id, data) {
    const updated = await this.reservationDetailRepository.update(id, data);
    return this.formatReservationDetailResponse(updated);
  }


  async deleteReservationDetail(id) {
    const detail = await this.reservationDetailRepository.findById(id);
    if (detail) {
      await this.tableRepository.updateStatus(detail.table_id, 'free');
    }
    await this.reservationDetailRepository.delete(id);
    return { success: true };
  }

  formatReservationDetailResponse(detail) {
    return {
      id: detail._id || detail.id,
      reservation_id: detail.reservation_id,
      table_id: detail.table_id,
      reservation_date: detail.reservation_date,
      reservation_time: detail.reservation_time
    };
  }
}

module.exports = ReservationDetailService;
