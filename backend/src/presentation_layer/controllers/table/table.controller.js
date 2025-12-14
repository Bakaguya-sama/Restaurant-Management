const TableService = require('../../../application_layer/table/table.service');

class TableController {
  constructor() {
    this.tableService = new TableService();
  }

  async getAllTables(req, res) {
    try {
      const { area, status, floor } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (floor) {
        const floorDoc = await require('../../models').Floor.findOne({ floor_name: floor });
        if (floorDoc) filters.floor_id = floorDoc._id;
      }
      if (area) {
        const location = await require('../../models').Location.findOne({ name: area });
        if (location) filters.location_id = location._id;
      }

      const tables = await this.tableService.getAllTables(filters);

      const formattedTables = await Promise.all(
        tables.map(table => this.tableService.formatTableResponse(table, true))
      );

      res.json({
        success: true,
        data: formattedTables,
        message: 'Tables retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message || 'Error fetching tables'
      });
    }
  }

  async getTableById(req, res) {
    try {
      const table = await this.tableService.getTableById(req.params.id);
      const formatted = await this.tableService.formatTableResponse(table, true);

      res.json({
        success: true,
        data: formatted,
        message: 'Table retrieved successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Table not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getTablesByLocation(req, res) {
    try {
      const tables = await this.tableService.getTablesByLocation(req.params.locationId);
      const formattedTables = await Promise.all(
        tables.map(table => this.tableService.formatTableResponse(table, true))
      );

      res.json({
        success: true,
        data: formattedTables,
        message: 'Tables retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getTablesByStatus(req, res) {
    try {
      const tables = await this.tableService.getTablesByStatus(req.params.statusString);
      const formattedTables = await Promise.all(
        tables.map(table => this.tableService.formatTableResponse(table, true))
      );

      res.json({
        success: true,
        data: formattedTables,
        message: `Tables with status '${req.params.statusString}' retrieved successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getTableStatusSummary(req, res) {
    try {
      const { summary, total } = await this.tableService.getTableStatusSummary();
      const validStatuses = ['free', 'occupied', 'reserved', 'dirty', 'broken'];

      res.json({
        success: true,
        data: {
          validStatuses,
          summary,
          total
        },
        message: 'Table status summary retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async createTable(req, res) {
    try {
      const { number, seats, area, floor } = req.body;

      if (!number || seats === undefined) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'number and seats are required'
        });
      }

      const table = await this.tableService.createTable({
        number,
        seats,
        area
      });

      const formatted = await this.tableService.formatTableResponse(table, true);

      res.status(201).json({
        success: true,
        data: formatted,
        message: 'Table created successfully'
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

  async updateTable(req, res) {
    try {
      const { number, seats, area, status } = req.body;

      if (!number || seats === undefined) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'number and seats are required'
        });
      }

      const table = await this.tableService.updateTable(req.params.id, {
        number,
        seats,
        area,
        status
      });

      const formatted = await this.tableService.formatTableResponse(table, true);

      res.json({
        success: true,
        data: formatted,
        message: 'Table updated successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Table not found' ? 404 : 
                        error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateTableStatus(req, res) {
    try {
      const { status, brokenReason } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'status is required'
        });
      }

      const table = await this.tableService.updateTableStatus(
        req.params.id,
        status,
        brokenReason
      );

      const formatted = await this.tableService.formatTableResponse(table, true);

      res.json({
        success: true,
        data: formatted,
        message: 'Table status updated successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Table not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async deleteTable(req, res) {
    try {
      const table = await this.tableService.deleteTable(req.params.id);
      const formatted = await this.tableService.formatTableResponse(table, true);

      res.json({
        success: true,
        data: formatted,
        message: 'Table deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Table not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }
}

module.exports = TableController;
