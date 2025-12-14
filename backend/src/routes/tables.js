const express = require('express');
const router = express.Router();
const { Table, Location } = require('../models');

// ==================== TABLE ROUTES ====================

/**
 * @route   GET /api/tables
 * @desc    Get all tables with optional filtering
 * @access  Public
 * @query   status, location_id
 */
router.get('/', async (req, res) => {
  try {
    const { status, location_id } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (location_id) {
      filter.location_id = location_id;
    }

    const tables = await Table.find(filter)
      .populate('location_id', 'name floor_id')
      .sort({ table_number: 1 });

    res.json({
      success: true,
      data: tables,
      count: tables.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tables',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tables/:id
 * @desc    Get table by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('location_id', 'name floor_id');
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tables/location/:locationId
 * @desc    Get all tables for a specific location
 * @access  Public
 */
router.get('/location/:locationId', async (req, res) => {
  try {
    // check location exists
    const location = await Location.findById(req.params.locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const tables = await Table.find({ location_id: req.params.locationId })
      .populate('location_id', 'name floor_id')
      .sort({ table_number: 1 });

    res.json({
      success: true,
      data: tables,
      count: tables.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tables for location',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tables/status/available
 * @desc    Get all available tables
 * @access  Public
 */
router.get('/status/available', async (req, res) => {
  try {
    const tables = await Table.find({ status: 'available' })
      .populate('location_id', 'name floor_id')
      .sort({ table_number: 1 });

    res.json({
      success: true,
      data: tables,
      count: tables.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available tables',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tables/status/summary
 * @desc    Get summary of tables by status
 * @access  Public
 */
router.get('/status/summary', async (req, res) => {
  try {
    const summary = await Table.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching table status summary',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/tables
 * @desc    Create a new table
 * @access  Private (Manager/Admin)
 * @body    { table_number, capacity, location_id, status }
 */
router.post('/', async (req, res) => {
  try {
    const { table_number, capacity, location_id, status } = req.body;

    // Validation
    if (!table_number || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'table_number and capacity are required'
      });
    }

    // Check if capacity is a positive number
    if (capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be greater than 0'
      });
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ table_number });
    if (existingTable) {
      return res.status(409).json({
        success: false,
        message: 'Table with this number already exists'
      });
    }

    // check location_id
    if (location_id) {
      const location = await Location.findById(location_id);
      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Location not found'
        });
      }
    }

    // check valid status if provided
    const validStatuses = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const newTable = new Table({
      table_number,
      capacity,
      location_id: location_id || null,
      status: status || 'available'
    });

    const savedTable = await newTable.save();
    await savedTable.populate('location_id', 'name floor_id');

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: savedTable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating table',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/tables/:id
 * @desc    Update a table
 * @access  Private (Manager/Admin)
 * @body    { table_number, capacity, location_id, status }
 */
router.put('/:id', async (req, res) => {
  try {
    const { table_number, capacity, location_id, status } = req.body;

    // check if table exists
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // check capacity if provided
    if (capacity !== undefined && capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be greater than 0'
      });
    }

    // Check for duplicate table_number
    if (table_number) {
      const duplicateTable = await Table.findOne({
        _id: { $ne: req.params.id },
        table_number
      });

      if (duplicateTable) {
        return res.status(409).json({
          success: false,
          message: 'Table with this number already exists'
        });
      }
    }

    // check location_id
    if (location_id) {
      const location = await Location.findById(location_id);
      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Location not found'
        });
      }
    }

    // check status if provided
    const validStatuses = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Update table
    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      {
        ...(table_number && { table_number }),
        ...(capacity !== undefined && { capacity }),
        ...(location_id && { location_id }),
        ...(status && { status })
      },
      { new: true, runValidators: true }
    ).populate('location_id', 'name floor_id');

    res.json({
      success: true,
      message: 'Table updated successfully',
      data: updatedTable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating table',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/tables/:id/status
 * @desc    Update only the status of a table
 * @access  Private (Manager/Waiter/Cashier)
 * @body    { status }
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required'
      });
    }

    const validStatuses = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('location_id', 'name floor_id');

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      message: 'Table status updated successfully',
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating table status',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/tables/:id
 * @desc    Delete a table
 * @access  Private (Manager/Admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      message: 'Table deleted successfully',
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting table',
      error: error.message
    });
  }
});

module.exports = router;
