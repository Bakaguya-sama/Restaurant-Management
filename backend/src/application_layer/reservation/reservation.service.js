const ReservationRepository = require('../../infrastructure_layer/reservation/reservation.repository');
const ReservationDetailRepository = require('../../infrastructure_layer/reservationdetail/reservationdetail.repository');
const TableRepository = require('../../infrastructure_layer/table/table.repository');
const ReservationEntity = require('../../domain_layer/reservation/reservation.entity');

class ReservationService {
  constructor() {
    this.reservationRepository = new ReservationRepository();
    this.reservationDetailRepository = new ReservationDetailRepository();
    this.tableRepository = new TableRepository();
  }

  isWithin60Minutes(reservationDate, reservationTime) {
    const [year, month, day] = reservationDate.split('-').map(Number);
    const [hour, minute] = reservationTime.split(':').map(Number);
    const reservationDateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    const timeDifference = reservationDateTime - now;
    const oneHourMs = 60 * 60 * 1000;
    return timeDifference <= oneHourMs && timeDifference > 0;
  }

  shouldAutoCancelReservation(reservation) {
    const [year, month, day] = reservation.reservation_date.split('-').map(Number);
    const [checkoutHour, checkoutMinute] = reservation.reservation_checkout_time.split(':').map(Number);
    const [resHour, resMinute] = reservation.reservation_time.split(':').map(Number);
    
    const reservationTime = new Date(year, month - 1, day, resHour, resMinute);
    const checkoutTime = new Date(year, month - 1, day, checkoutHour, checkoutMinute);
    const now = new Date();
    const oneHourMs = 60 * 60 * 1000;
    
    if (reservation.status === 'in_progress' && now - reservationTime > oneHourMs) {
      return true;
    }
    
    if (now > checkoutTime && reservation.status !== 'completed' && reservation.status !== 'cancelled') {
      return true;
    }
    
    return false;
  }

  async updateStatus(reservation) {
    if (this.shouldAutoCancelReservation(reservation)) {
      if (reservation.status !== 'cancelled') {
        await this.reservationRepository.update(reservation._id, { status: 'cancelled' });
      }
      return reservation;
    }
    
    if (reservation.status !== 'pending' && reservation.status !== 'confirmed') {
      return reservation;
    }
    
    if (this.isWithin60Minutes(reservation.reservation_date, reservation.reservation_time)) {
      const updated = await this.reservationRepository.update(reservation._id, { status: 'in_progress' });
      return this.formatReservationResponse(updated);
    }
    
    return reservation;
  }

  async getAllReservations(filters = {}) {
    const reservations = await this.reservationRepository.findAll(filters);
    const result = [];
    for (const r of reservations) {
      const updated = await this.updateStatus(r);
      result.push(this.formatReservationResponse(updated));
    }
    return result;
  }

  async getReservationById(id) {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    const updated = await this.updateStatus(reservation);
    return this.formatReservationResponse(updated);
  }

  async getReservationsByCustomerId(customerId) {
    const reservations = await this.reservationRepository.findByCustomerId(customerId);
    const result = [];
    for (const r of reservations) {
      const updated = await this.updateStatus(r);
      result.push(this.formatReservationResponse(updated));
    }
    return result;
  }

  async getReservationsByTableId(tableId) {
    const reservations = await this.reservationRepository.findByTableId(tableId);
    const result = [];
    for (const r of reservations) {
      const updated = await this.updateStatus(r);
      result.push(this.formatReservationResponse(updated));
    }
    return result;
  }

  async getReservationStatistics() {
    return await this.reservationRepository.getStatistics();
  }

  async addTableToReservation(reservationId, tableData) {
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) throw new Error('Reservation not found');
    const { reservation_date, reservation_time, number_of_guests } = reservation;
    const table = await this.tableRepository.findById(tableData.table_id);
    if (!table) throw new Error('Table not found');
    if (number_of_guests > table.capacity) throw new Error('Number of guests exceeds table capacity');
    const conflict = await this.reservationDetailRepository.findByTableAndTime(
      tableData.table_id,
      reservation_date,
      reservation_time
    );
    if (conflict) throw new Error('Table is already reserved for this time slot');
    await this.reservationDetailRepository.addTableToReservation(
      reservationId,
      tableData.table_id,
      reservation_date,
      reservation_time
    );
    if (this.isWithin60Minutes(reservation_date, reservation_time)) {
      await this.tableRepository.updateStatus(tableData.table_id, 'reserved');
    }
    return { success: true };
  }

  async removeTableFromReservation(reservationId, tableId) {
    const detail = await this.reservationDetailRepository.findByReservationIdAndTableId(reservationId, tableId);
    if (!detail) throw new Error('Table not found in reservation');
    await this.reservationDetailRepository.removeTableFromReservation(reservationId, tableId);
    await this.tableRepository.updateStatus(tableId, 'free');
    return { success: true };
  }


  async createReservation(data) {
    const entity = new ReservationEntity(data);
    const validation = entity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    if (!data.details || !Array.isArray(data.details) || data.details.length === 0) {
      throw new Error('Reservation must include at least one table');
    }
    for (const detail of data.details) {
      const table = await this.tableRepository.findById(detail.table_id);
      if (!table) throw new Error('Table not found');
      if (data.number_of_guests > table.capacity) {
        throw new Error('Number of guests exceeds table capacity');
      }
      const conflict = await this.reservationDetailRepository.findByTableAndTime(
        detail.table_id,
        data.reservation_date,
        data.reservation_time
      );
      if (conflict) {
        throw new Error('Table is already reserved for this time slot');
      }
    }
    const reservation = await this.reservationRepository.create(data);
    for (const detail of data.details) {
      await this.reservationDetailRepository.create({
        reservation_id: reservation._id,
        table_id: detail.table_id,
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time
      });
      if (this.isWithin60Minutes(data.reservation_date, data.reservation_time)) {
        await this.tableRepository.updateStatus(detail.table_id, 'reserved');
      }
    }
    return this.formatReservationResponse(reservation);
  }


  async updateReservation(id, data) {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) throw new Error('Reservation not found');
    const entity = new ReservationEntity(reservation);
    if (data.status === 'cancelled' && !entity.canCancel()) {
      throw new Error('Only pending or confirmed reservations can be cancelled');
    }
    if (data.details && Array.isArray(data.details)) {
      for (const detail of data.details) {
        const table = await this.tableRepository.findById(detail.table_id);
        if (!table) throw new Error('Table not found');
        if ((data.number_of_guests || reservation.number_of_guests) > table.capacity) {
          throw new Error('Number of guests exceeds table capacity');
        }
        const conflict = await this.reservationDetailRepository.findByTableAndTime(
          detail.table_id,
          data.reservation_date || reservation.reservation_date,
          data.reservation_time || reservation.reservation_time
        );
        if (conflict && String(conflict.reservation_id) !== String(id)) {
          throw new Error('Table is already reserved for this time slot');
        }
      }
    }
    const updated = await this.reservationRepository.update(id, data);
    if (data.status === 'cancelled') {
      const reservation = await this.reservationRepository.findById(id);
      if (this.isWithin60Minutes(reservation.reservation_date, reservation.reservation_time)) {
        const details = await this.reservationDetailRepository.findAll({ reservation_id: id });
        for (const detail of details) {
          await this.tableRepository.updateStatus(detail.table_id, 'free');
        }
      }
    }
    return this.formatReservationResponse(updated);
  }

  async updateReservationStatus(id, status) {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const entity = new ReservationEntity(reservation);
    const statusValidation = { isValid: true, errors: [] };

    if (!['pending', 'confirmed', 'in_progress', 'cancelled', 'completed'].includes(status)) {
      throw new Error('Invalid status value');
    }

    if (status === 'cancelled' && !entity.canCancel()) {
      throw new Error('Only pending or confirmed reservations can be cancelled');
    }

    const updated = await this.reservationRepository.update(id, { status });

    if (status === 'cancelled') {
      if (this.isWithin60Minutes(reservation.reservation_date, reservation.reservation_time)) {
        const details = await this.reservationDetailRepository.findAll({ reservation_id: id });
        for (const detail of details) {
          await this.tableRepository.updateStatus(detail.table_id, 'free');
        }
      }
    }

    return this.formatReservationResponse(updated);
  }

  async deleteReservation(id) {
    const details = await this.reservationDetailRepository.findAll({ reservation_id: id });
    for (const detail of details) {
      await this.tableRepository.updateStatus(detail.table_id, 'free');
    }
    await this.reservationDetailRepository.deleteByReservationId(id);
    return await this.reservationRepository.delete(id);
  }

  formatReservationResponse(reservation) {
    return {
      id: reservation._id || reservation.id,
      customer_id: reservation.customer_id,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      reservation_checkout_time: reservation.reservation_checkout_time,
      number_of_guests: reservation.number_of_guests,
      status: reservation.status,
      special_requests: reservation.special_requests,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at
    };
  }
}

module.exports = ReservationService;
