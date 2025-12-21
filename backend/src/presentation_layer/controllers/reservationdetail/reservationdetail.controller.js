const ReservationDetailService = require('../../../application_layer/reservationdetail/reservationdetail.service');

class ReservationDetailController {
  constructor() {
    this.reservationDetailService = new ReservationDetailService();
  }

  async getAllReservationDetails(req, res) {
    try {
      const filters = req.query || {};
      const details = await this.reservationDetailService.getAllReservationDetails(filters);
      res.json({ success: true, data: details, message: 'ReservationDetails retrieved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, data: null, message: error.message });
    }
  }

  async getDetailsByReservationId(req, res) {
    try {
      const details = await this.reservationDetailService.getAllReservationDetails({ reservation_id: req.params.reservationId });
      res.json({ success: true, data: details, message: 'ReservationDetails by reservation retrieved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, data: null, message: error.message });
    }
  }

  async getDetailsByTableId(req, res) {
    try {
      const details = await this.reservationDetailService.getAllReservationDetails({ table_id: req.params.tableId });
      res.json({ success: true, data: details, message: 'ReservationDetails by table retrieved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, data: null, message: error.message });
    }
  }

  async getReservationDetailById(req, res) {
    try {
      const detail = await this.reservationDetailService.getReservationDetailById(req.params.id);
      res.json({ success: true, data: detail, message: 'ReservationDetail retrieved successfully' });
    } catch (error) {
      res.status(404).json({ success: false, data: null, message: error.message });
    }
  }

  async createReservationDetail(req, res) {
    try {
      const detail = await this.reservationDetailService.createReservationDetail(req.body);
      res.status(201).json({ success: true, data: detail, message: 'ReservationDetail created successfully' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async updateReservationDetail(req, res) {
    try {
      const detail = await this.reservationDetailService.updateReservationDetail(req.params.id, req.body);
      res.json({ success: true, data: detail, message: 'ReservationDetail updated successfully' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }

  async deleteReservationDetail(req, res) {
    try {
      await this.reservationDetailService.deleteReservationDetail(req.params.id);
      res.json({ success: true, data: null, message: 'ReservationDetail deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, data: null, message: error.message });
    }
  }
}

module.exports = ReservationDetailController;
