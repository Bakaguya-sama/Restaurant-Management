const express = require('express');
const router = express.Router();
const { Table, Location, Floor } = require('../models');

// GET all tables with optional filters
router.get('/', async (req, res) => {
  try {
    const { area, status, floor } = req.query;
    
    let query = {};
    
    if (area) {
      const location = await Location.findOne({ name: area });
      if (location) {
        query.location_id = location._id;
      }
    }

    if (status) {
      query.status = status;
    }

    if (floor) {
      const floorDoc = await Floor.findOne({ floor_name: floor });
      if (floorDoc) {
        const locations = await Location.find({ floor_id: floorDoc._id });
        const locationIds = locations.map(loc => loc._id);
        query.location_id = { $in: locationIds };
      }
    }

    const tables = await Table.find(query)
      .populate('location_id', 'name')
      .select('_id table_number location_id capacity status brokenReason created_at');

    // Get floor info for each table
    const formattedTables = await Promise.all(
      tables.map(async (table) => {
        let floorName = null;
        if (table.location_id) {
          const location = await Location.findById(table.location_id).populate('floor_id', 'floor_name');
          if (location && location.floor_id) {
            floorName = location.floor_id.floor_name;
          }
        }

        const result = {
          id: table._id,
          number: table.table_number,
          area: table.location_id ? table.location_id.name : null,
          location_id: table.location_id ? table.location_id._id : null,
          seats: table.capacity,
          status: table.status,
          floor: floorName
        };

        if (table.brokenReason) {
          result.brokenReason = table.brokenReason;
        }

        return result;
      })
    );

    res.json({
      success: true,
      data: formattedTables,
      message: 'Tables retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error fetching tables'
    });
  }
});

// GET table by ID
router.get('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate('location_id', 'name')
      .select('_id table_number location_id capacity status brokenReason created_at');

    if (!table) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Table not found'
      });
    }

    let floorName = null;
    if (table.location_id) {
      const location = await Location.findById(table.location_id).populate('floor_id', 'floor_name');
      if (location && location.floor_id) {
        floorName = location.floor_id.floor_name;
      }
    }

    const result = {
      id: table._id,
      number: table.table_number,
      area: table.location_id ? table.location_id.name : null,
      location_id: table.location_id ? table.location_id._id : null,
      seats: table.capacity,
      status: table.status,
      floor: floorName
    };

    if (table.brokenReason) {
      result.brokenReason = table.brokenReason;
    }

    res.json({
      success: true,
      data: result,
      message: 'Table retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error fetching table'
    });
  }
});

// POST create new table
router.post('/', async (req, res) => {
  try {
    const { number, seats, area, floor } = req.body;

    // Validation
    if (!number || seats === undefined) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'number and seats are required'
      });
    }

    if (seats <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'seats must be greater than 0'
      });
    }

    // Check if table with same number already exists
    const existingTable = await Table.findOne({ table_number: number });
    if (existingTable) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Table with this number already exists'
      });
    }

    // Get location if provided
    let locationId = null;
    let floorName = null;
    if (area) {
      const location = await Location.findById(area);
      if (!location) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Location not found'
        });
      }
      locationId = location._id;
      
      // Get floor name
      const floorDoc = await Floor.findById(location.floor_id);
      if (floorDoc) {
        floorName = floorDoc.floor_name;
      }
    }

    const table = new Table({
      table_number: number,
      capacity: seats,
      status: 'free',
      location_id: locationId
    });

    const savedTable = await table.save();
    await savedTable.populate('location_id', 'name');

    const result = {
      id: savedTable._id,
      number: savedTable.table_number,
      area: savedTable.location_id ? savedTable.location_id.name : null,
      seats: savedTable.capacity,
      status: savedTable.status,
      floor: floorName
    };

    res.status(201).json({
      success: true,
      data: result,
      message: 'Table created successfully'
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error creating table'
    });
  }
});

// PUT update table
router.put('/:id', async (req, res) => {
  try {
    const { number, seats, area, status } = req.body;

    // Validation
    if (!number || seats === undefined) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'number and seats are required'
      });
    }

    if (seats <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'seats must be greater than 0'
      });
    }

    // Check if another table already has this number
    const existingTable = await Table.findOne({
      _id: { $ne: req.params.id },
      table_number: number
    });

    if (existingTable) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Table number already exists'
      });
    }

    // Get location if provided
    let locationId = null;
    let floorName = null;
    if (area) {
      const location = await Location.findById(area);
      if (!location) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Location not found'
        });
      }
      locationId = location._id;

      // Get floor name
      const floorDoc = await Floor.findById(location.floor_id);
      if (floorDoc) {
        floorName = floorDoc.floor_name;
      }
    }

    const updateData = {
      table_number: number,
      capacity: seats
    };

    if (area) {
      updateData.location_id = locationId;
    }

    if (status) {
      updateData.status = status;
    }

    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('location_id', 'name')
     .select('_id table_number location_id capacity status brokenReason created_at');

    if (!updatedTable) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Table not found'
      });
    }

    if (!floorName && updatedTable.location_id) {
      const location = await Location.findById(updatedTable.location_id).populate('floor_id', 'floor_name');
      if (location && location.floor_id) {
        floorName = location.floor_id.floor_name;
      }
    }

    const result = {
      id: updatedTable._id,
      number: updatedTable.table_number,
      area: updatedTable.location_id ? updatedTable.location_id.name : null,
      seats: updatedTable.capacity,
      status: updatedTable.status,
      floor: floorName
    };

    if (updatedTable.brokenReason) {
      result.brokenReason = updatedTable.brokenReason;
    }

    res.json({
      success: true,
      data: result,
      message: 'Table updated successfully'
    });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error updating table'
    });
  }
});

// PATCH update table status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, brokenReason } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'status is required'
      });
    }

    const validStatuses = ['free', 'occupied', 'reserved', 'dirty', 'broken'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid status'
      });
    }

    const updateData = {
      status
    };

    if (brokenReason) {
      updateData.brokenReason = brokenReason;
    }

    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('location_id', 'name')
     .select('_id table_number location_id capacity status brokenReason created_at');

    if (!updatedTable) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Table not found'
      });
    }

    let floorName = null;
    if (updatedTable.location_id) {
      const location = await Location.findById(updatedTable.location_id).populate('floor_id', 'floor_name');
      if (location && location.floor_id) {
        floorName = location.floor_id.floor_name;
      }
    }

    const result = {
      id: updatedTable._id,
      number: updatedTable.table_number,
      area: updatedTable.location_id ? updatedTable.location_id.name : null,
      seats: updatedTable.capacity,
      status: updatedTable.status,
      floor: floorName
    };

    if (updatedTable.brokenReason) {
      result.brokenReason = updatedTable.brokenReason;
    }

    res.json({
      success: true,
      data: result,
      message: 'Table status updated successfully'
    });
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error updating table status'
    });
  }
});

// DELETE table
router.delete('/:id', async (req, res) => {
  try {
    const deletedTable = await Table.findByIdAndDelete(req.params.id)
      .populate('location_id', 'name');

    if (!deletedTable) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Table not found'
      });
    }

    let floorName = null;
    if (deletedTable.location_id) {
      const location = await Location.findById(deletedTable.location_id).populate('floor_id', 'floor_name');
      if (location && location.floor_id) {
        floorName = location.floor_id.floor_name;
      }
    }

    const result = {
      id: deletedTable._id,
      number: deletedTable.table_number,
      area: deletedTable.location_id ? deletedTable.location_id.name : null,
      seats: deletedTable.capacity,
      status: deletedTable.status,
      floor: floorName
    };

    if (deletedTable.brokenReason) {
      result.brokenReason = deletedTable.brokenReason;
    }

    res.json({
      success: true,
      data: result,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error deleting table'
    });
  }
});

module.exports = router;
