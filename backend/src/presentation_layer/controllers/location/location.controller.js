const LocationService = require('../../../application_layer/location/location.service');

class LocationController {
  constructor() {
    this.locationService = new LocationService();
  }

  async getAllLocations(req, res) {
    try {
      const { floor } = req.query;
      const filters = {};

      if (floor) {
        const { Floor } = require('../../models');
        const floorDoc = await Floor.findOne({ floor_name: floor });
        if (floorDoc) {
          filters.floor_id = floorDoc._id;
        }
      }

      const locations = await this.locationService.getAllLocations(filters);

      // Format response with floor name
      const formattedLocations = locations.map(location => {
        return location.formatResponse();
      });

      res.json({
        success: true,
        data: formattedLocations,
        message: 'Locations retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message || 'Error fetching locations'
      });
    }
  }

  async getLocationById(req, res) {
    try {
      const location = await this.locationService.getLocationById(req.params.id);
      const formatted = location.formatResponse();

      res.json({
        success: true,
        data: formatted,
        message: 'Location retrieved successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Location not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getLocationsByFloor(req, res) {
    try {
      const locations = await this.locationService.getLocationsByFloorId(req.params.floorId);
      
      // Format response with floor name
      const formattedLocations = locations.map(location => {
        return location.formatResponse();
      });

      res.json({
        success: true,
        data: formattedLocations,
        message: 'Locations retrieved successfully'
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

  async createLocation(req, res) {
    try {
      const { name, floor, description } = req.body;

      if (!name || !floor) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'name and floor are required'
        });
      }

      const location = await this.locationService.createLocation({
        name,
        floorId: floor,
        description
      });

      const formatted = location.formatResponse();

      res.status(201).json({
        success: true,
        data: formatted,
        message: 'Location created successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 409 :
                        error.message === 'Floor not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateLocation(req, res) {
    try {
      const { name, floor, description } = req.body;

      if (!name || !floor) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'name and floor are required'
        });
      }

      const location = await this.locationService.updateLocation(req.params.id, {
        name,
        floorId: floor,
        description
      });

      const formatted = location.formatResponse();

      res.json({
        success: true,
        data: formatted,
        message: 'Location updated successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Location not found' ? 404 :
                        error.message === 'Floor not found' ? 404 :
                        error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async deleteLocation(req, res) {
    try {
      const location = await this.locationService.deleteLocation(req.params.id);
      const formatted = location.formatResponse();

      res.json({
        success: true,
        data: formatted,
        message: 'Location deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Location not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }
}

module.exports = LocationController;
