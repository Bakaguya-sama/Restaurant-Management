const FloorService = require('../../../application_layer/floor/floor.service');

class FloorController {
  constructor() {
    this.floorService = new FloorService();
  }

  async getAllFloors(req, res) {
    try {
      const floors = await this.floorService.getAllFloors();
      const formattedFloors = floors.map(floor => this.floorService.formatFloorResponse(floor));

      res.json({
        success: true,
        data: formattedFloors,
        message: 'Floors retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message || 'Error fetching floors'
      });
    }
  }

  async getFloorById(req, res) {
    try {
      const floor = await this.floorService.getFloorById(req.params.id);
      const formatted = this.floorService.formatFloorResponse(floor);

      res.json({
        success: true,
        data: formatted,
        message: 'Floor retrieved successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Floor not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async createFloor(req, res) {
    try {
      const { name, level, description } = req.body;

      if (!name || level === undefined) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'name and level are required'
        });
      }

      const floor = await this.floorService.createFloor({
        name,
        level,
        description
      });

      const formatted = this.floorService.formatFloorResponse(floor);

      res.status(201).json({
        success: true,
        data: formatted,
        message: 'Floor created successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateFloor(req, res) {
    try {
      const { name, level, description } = req.body;

      if (!name || level === undefined) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'name and level are required'
        });
      }

      const floor = await this.floorService.updateFloor(req.params.id, {
        name,
        level,
        description
      });

      const formatted = this.floorService.formatFloorResponse(floor);

      res.json({
        success: true,
        data: formatted,
        message: 'Floor updated successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Floor not found' ? 404 :
                        error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async deleteFloor(req, res) {
    try {
      const floor = await this.floorService.deleteFloor(req.params.id);
      const formatted = this.floorService.formatFloorResponse(floor);

      res.json({
        success: true,
        data: formatted,
        message: 'Floor deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Floor not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }
}

module.exports = FloorController;
