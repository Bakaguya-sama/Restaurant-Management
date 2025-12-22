const StaffService = require('../../../application_layer/staff/staff.service');
const UploadRepository = require('../../../infrastructure_layer/upload/upload.repository');

class StaffController {
  constructor() {
    this.staffService = new StaffService();
    this.uploadRepository = new UploadRepository('avatars');
  }

  async getAllStaff(req, res) {
    try {
      const filters = {
        role: req.query.role,
        is_active: req.query.is_active,
        search: req.query.search
      };

      const staff = await this.staffService.getAllStaff(filters);
      
      res.status(200).json({
        success: true,
        count: staff.length,
        data: staff
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getStaffById(req, res) {
    try {
      const staff = await this.staffService.getStaffById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: staff
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createStaff(req, res) {
    try {
      const staff = await this.staffService.createStaff(req.body);
      
      res.status(201).json({
        success: true,
        data: staff
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateStaff(req, res) {
    try {
      const staff = await this.staffService.updateStaff(req.params.id, req.body);
      
      res.status(200).json({
        success: true,
        data: staff
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteStaff(req, res) {
    try {
      const staffToDelete = await this.staffService.getStaffById(req.params.id);
      
      const result = await this.staffService.deleteStaff(req.params.id);
      
      if (staffToDelete.image_url) {
        try {
          const imagePathParts = staffToDelete.image_url.split('/');
          const filename = imagePathParts[imagePathParts.length - 1];
          
          if (filename) {
            await this.uploadRepository.deleteImage(filename);
          }
        } catch (imageDeleteError) {
          console.warn(`Warning: Failed to delete avatar for staff ${req.params.id}:`, imageDeleteError.message);
        }
      }
      
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

  async deactivateStaff(req, res) {
    try {
      const staff = await this.staffService.deactivateStaff(req.params.id);
      
      res.status(200).json({
        success: true,
        data: staff
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async activateStaff(req, res) {
    try {
      const staff = await this.staffService.activateStaff(req.params.id);
      
      res.status(200).json({
        success: true,
        data: staff
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async loginStaff(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      const result = await this.staffService.loginStaff(username, password);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async getStaffStatistics(req, res) {
    try {
      const stats = await this.staffService.getStaffStatistics();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = StaffController;
