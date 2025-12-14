const express = require('express');
const router = express.Router();
const { Location, Floor } = require('../models');

// ==================== LOCATION ROUTES ====================

/**
 * @route   GET /api/locations
 * @desc    Get all locations
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().populate('floor_id', 'floor_name floor_number');
    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/locations/:id
 * @desc    Get location by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate('floor_id', 'floor_name floor_number');
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching location',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/locations/floor/:floorId
 * @desc    Get all locations for a specific floor
 * @access  Public
 */
router.get('/floor/:floorId', async (req, res) => {
  try {
    // Verify floor exists
    const floor = await Floor.findById(req.params.floorId);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    const locations = await Location.find({ floor_id: req.params.floorId }).populate('floor_id', 'floor_name floor_number');
    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching locations for floor',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/locations
 * @desc    Create a new location
 * @access  Private (Manager/Admin)
 * @body    { name, floor_id, description }
 */
router.post('/', async (req, res) => {
  try {
    const { name, floor_id, description } = req.body;

    // Validation
    if (!name || !floor_id) {
      return res.status(400).json({
        success: false,
        message: 'name and floor_id are required'
      });
    }

    // Verify floor exists
    const floor = await Floor.findById(floor_id);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    // Check if location with same name already exists
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return res.status(409).json({
        success: false,
        message: 'Location with this name already exists'
      });
    }

    const newLocation = new Location({
      name,
      floor_id,
      description
    });

    const savedLocation = await newLocation.save();
    await savedLocation.populate('floor_id', 'floor_name floor_number');

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: savedLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating location',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/locations/:id
 * @desc    Update a location
 * @access  Private (Manager/Admin)
 * @body    { name, floor_id, description }
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, floor_id, description } = req.body;

    // Check if location exists
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // If floor_id is being updated, verify it exists
    if (floor_id) {
      const floor = await Floor.findById(floor_id);
      if (!floor) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }
    }

    // Check for duplicate location name (excluding current location)
    if (name) {
      const duplicateLocation = await Location.findOne({
        _id: { $ne: req.params.id },
        name
      });

      if (duplicateLocation) {
        return res.status(409).json({
          success: false,
          message: 'Location with this name already exists'
        });
      }
    }

    // Update location
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(floor_id && { floor_id }),
        ...(description !== undefined && { description })
      },
      { new: true, runValidators: true }
    ).populate('floor_id', 'floor_name floor_number');

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: updatedLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete a location
 * @access  Private (Manager/Admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully',
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting location',
      error: error.message
    });
  }
});

module.exports = router;
