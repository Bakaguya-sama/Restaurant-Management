  const ReservationService = require('../../../application_layer/reservation/reservation.service');

class ReservationController {
  constructor() {
    this.reservationService = new ReservationService();
  }

  async getAllReservations(req, res) {
    try {
      const filters = req.query || {};
      const reservations = await this.reservationService.getAllReservations(filters);
      res.json({ success: true, data: reservations, message: 'Reservations retrieved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, data: null, message: error.message });
    }
  }

  async getReservationById(req, res) {
    try {
      const reservation = await this.reservationService.getReservationById(req.params.id);
      res.json({ success: true, data: reservation, message: 'Reservation retrieved successfully' });
    } catch (error) {
      res.status(404).json({ success: false, data: null, message: error.message });
    }
  }

  async createReservation(req, res) {
    try {
      const reservation = await this.reservationService.createReservation(req.body);
      res.status(201).json({ success: true, data: reservation, message: 'Reservation created successfully' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async updateReservation(req, res) {
    try {
      const reservation = await this.reservationService.updateReservation(req.params.id, req.body);
      res.json({ success: true, data: reservation, message: 'Reservation updated successfully' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async updateReservationStatus(req, res) {
    try {
      const { status } = req.body;
      const reservation = await this.reservationService.updateReservationStatus(req.params.id, status);
      res.json({ success: true, data: reservation, message: 'Reservation status updated successfully' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async deleteReservation(req, res) {
    try {
      await this.reservationService.deleteReservation(req.params.id);
      res.json({ success: true, data: null, message: 'Reservation deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async getReservationsByCustomerId(req, res) {
    try {
      const reservations = await this.reservationService.getReservationsByCustomerId(req.params.customerId);
      res.json({ success: true, data: reservations, message: 'Reservations by customer' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async getReservationsByTableId(req, res) {
    try {
      const reservations = await this.reservationService.getReservationsByTableId(req.params.tableId);
      res.json({ success: true, data: reservations, message: 'Reservations by table' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async getReservationStatistics(req, res) {
    try {
      const stats = await this.reservationService.getReservationStatistics();
      res.json({ success: true, data: stats, message: 'Reservation statistics' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async addTableToReservation(req, res) {
    try {
      const result = await this.reservationService.addTableToReservation(req.params.id, req.body);
      res.json({ success: true, data: result, message: 'Table added to reservation' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async removeTableFromReservation(req, res) {
    try {
      const result = await this.reservationService.removeTableFromReservation(req.params.id, req.params.tableId);
      res.json({ success: true, data: result, message: 'Table removed from reservation' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }
}

module.exports = ReservationController;
