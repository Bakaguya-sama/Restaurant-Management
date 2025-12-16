const ComplaintService = require('../../../application_layer/complaint/complaint.service');

class ComplaintController {
  constructor() {
    this.complaintService = new ComplaintService();
  }

  async getAllComplaints(req, res) {
    try {
      const filters = {
        customer_id: req.query.customer_id,
        status: req.query.status,
        category: req.query.category,
        priority: req.query.priority,
        assigned_to_staff_id: req.query.assigned_to_staff_id
      };

      const complaints = await this.complaintService.getAllComplaints(filters);

      res.status(200).json({
        success: true,
        count: complaints.length,
        data: complaints
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getComplaintById(req, res) {
    try {
      const complaint = await this.complaintService.getComplaintById(req.params.id);

      res.status(200).json({
        success: true,
        data: complaint
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createComplaint(req, res) {
    try {
      const complaint = await this.complaintService.createComplaint(req.body);

      res.status(201).json({
        success: true,
        data: complaint
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateComplaint(req, res) {
    try {
      const complaint = await this.complaintService.updateComplaint(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: complaint
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateComplaintStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const complaint = await this.complaintService.updateComplaintStatus(req.params.id, status);

      res.status(200).json({
        success: true,
        data: complaint
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async assignComplaintToStaff(req, res) {
    try {
      const { staff_id } = req.body;

      if (!staff_id) {
        return res.status(400).json({
          success: false,
          message: 'Staff ID is required'
        });
      }

      const complaint = await this.complaintService.assignComplaintToStaff(req.params.id, staff_id);

      res.status(200).json({
        success: true,
        data: complaint
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async resolveComplaint(req, res) {
    try {
      const { resolution } = req.body;

      if (!resolution) {
        return res.status(400).json({
          success: false,
          message: 'Resolution is required'
        });
      }

      const complaint = await this.complaintService.resolveComplaint(req.params.id, resolution);

      res.status(200).json({
        success: true,
        data: complaint
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteComplaint(req, res) {
    try {
      const result = await this.complaintService.deleteComplaint(req.params.id);

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

  async getComplaintStatistics(req, res) {
    try {
      const statistics = await this.complaintService.getComplaintStatistics();

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
}

module.exports = ComplaintController;
