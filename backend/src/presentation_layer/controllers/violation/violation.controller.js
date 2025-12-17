const ViolationService = require('../../../application_layer/violation/violation.service');

class ViolationController {
  constructor() {
    this.violationService = new ViolationService();
  }

  async getAllViolations(req, res) {
    try {
      const filters = {
        customer_id: req.query.customer_id,
        violation_type: req.query.violation_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const violations = await this.violationService.getAllViolations(filters);

      res.status(200).json({
        success: true,
        count: violations.length,
        data: violations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getViolationById(req, res) {
    try {
      const violation = await this.violationService.getViolationById(req.params.id);

      res.status(200).json({
        success: true,
        data: violation
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getViolationsByCustomerId(req, res) {
    try {
      const violations = await this.violationService.getViolationsByCustomerId(req.params.customerId);

      res.status(200).json({
        success: true,
        count: violations.length,
        data: violations
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createViolation(req, res) {
    try {
      const violation = await this.violationService.createViolation(req.body);

      res.status(201).json({
        success: true,
        data: violation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateViolation(req, res) {
    try {
      const violation = await this.violationService.updateViolation(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: violation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteViolation(req, res) {
    try {
      const result = await this.violationService.deleteViolation(req.params.id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getViolationStatistics(req, res) {
    try {
      const statistics = await this.violationService.getViolationStatistics();

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTopViolators(req, res) {
    try {
      const limit = req.query.limit || 10;
      const topViolators = await this.violationService.getTopViolators(limit);

      res.status(200).json({
        success: true,
        data: topViolators
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ViolationController;
