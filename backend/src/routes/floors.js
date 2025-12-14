const express = require('express');
const router = express.Router();
const { Floor, Location } = require('../models');

// GET all floors
router.get('/', async (req, res) => {
  try {
    const floors = await Floor.find().select('_id floor_name floor_number description created_at');
    
    const formattedFloors = floors.map(floor => ({
      id: floor._id,
      name: floor.floor_name,
      level: floor.floor_number,
      description: floor.description
    }));

    res.json({
      success: true,
      data: formattedFloors,
      message: 'Floors retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching floors:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error fetching floors'
    });
  }
});

// GET floor by ID
router.get('/:id', async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id).select('_id floor_name floor_number description created_at');
    
    if (!floor) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Floor not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: floor._id,
        name: floor.floor_name,
        level: floor.floor_number,
        description: floor.description
      },
      message: 'Floor retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching floor:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error fetching floor'
    });
  }
});

// POST create new floor
router.post('/', async (req, res) => {
  try {
    const { name, level, description } = req.body;

    // Validation
    if (!name || level === undefined) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'name and level are required'
      });
    }

    // Check if floor with same name or level already exists
    const existingFloor = await Floor.findOne({
      $or: [{ floor_name: name }, { floor_number: level }]
    });

    if (existingFloor) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Floor with this name or level already exists'
      });
    }

    const floor = new Floor({
      floor_name: name,
      floor_number: level,
      description: description || ''
    });

    const savedFloor = await floor.save();

    res.status(201).json({
      success: true,
      data: {
        id: savedFloor._id,
        name: savedFloor.floor_name,
        level: savedFloor.floor_number,
        description: savedFloor.description
      },
      message: 'Floor created successfully'
    });
  } catch (error) {
    console.error('Error creating floor:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error creating floor'
    });
  }
});

// PUT update floor
router.put('/:id', async (req, res) => {
  try {
    const { name, level, description } = req.body;

    // Validation
    if (!name || level === undefined) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'name and level are required'
      });
    }

    // Check if another floor already has this name or level
    const existingFloor = await Floor.findOne({
      _id: { $ne: req.params.id },
      $or: [{ floor_name: name }, { floor_number: level }]
    });

    if (existingFloor) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Floor name or level already exists'
      });
    }

    const updatedFloor = await Floor.findByIdAndUpdate(
      req.params.id,
      { floor_name: name, floor_number: level, description: description || '' },
      { new: true }
    ).select('_id floor_name floor_number description created_at');

    if (!updatedFloor) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Floor not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedFloor._id,
        name: updatedFloor.floor_name,
        level: updatedFloor.floor_number,
        description: updatedFloor.description
      },
      message: 'Floor updated successfully'
    });
  } catch (error) {
    console.error('Error updating floor:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error updating floor'
    });
  }
});

// DELETE floor
router.delete('/:id', async (req, res) => {
  try {
    const attachedLocations = await Location.findOne({ floor_id: req.params.id });
    if (attachedLocations) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Cannot delete floor with attached locations'
      });
    }

    const deletedFloor = await Floor.findByIdAndDelete(req.params.id);

    if (!deletedFloor) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Floor not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: deletedFloor._id,
        name: deletedFloor.floor_name,
        level: deletedFloor.floor_number,
        description: deletedFloor.description
      },
      message: 'Floor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting floor:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error deleting floor'
    });
  }
});

module.exports = router;
