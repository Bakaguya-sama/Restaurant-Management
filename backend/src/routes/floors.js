const express = require('express');
const router = express.Router();
const { Floor } = require('../models');

// ==================== FLOOR ROUTES ====================

/**
 * @route   GET /api/floors
 * @desc    Get all floors
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const floors = await Floor.find().sort({ floor_number: 1 });
    res.json({
      success: true,
      data: floors,
      count: floors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floors',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/floors/:id
 * @desc    Get floor by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    res.json({
      success: true,
      data: floor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/floors
 * @desc    Create a new floor
 * @access  Private (Manager/Admin)
 * @body    { floor_name, floor_number, description }
 */
router.post('/', async (req, res) => {
  try {
    const { floor_name, floor_number, description } = req.body;

    // Validation
    if (!floor_name || floor_number === undefined) {
      return res.status(400).json({
        success: false,
        message: 'floor_name and floor_number are required'
      });
    }

    // Check if floor already exists
    const existingFloor = await Floor.findOne({
      $or: [
        { floor_name },
        { floor_number }
      ]
    });

    if (existingFloor) {
      return res.status(409).json({
        success: false,
        message: 'Floor with this name or number already exists'
      });
    }

    const newFloor = new Floor({
      floor_name,
      floor_number,
      description
    });

    const savedFloor = await newFloor.save();

    res.status(201).json({
      success: true,
      message: 'Floor created successfully',
      data: savedFloor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating floor',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/floors/:id
 * @desc    Update a floor
 * @access  Private (Manager/Admin)
 * @body    { floor_name, floor_number, description }
 */
router.put('/:id', async (req, res) => {
  try {
    const { floor_name, floor_number, description } = req.body;

    // Check if floor exists
    const floor = await Floor.findById(req.params.id);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    // Check for duplicate floor_name or floor_number
    if (floor_name || floor_number) {
      const duplicateFloor = await Floor.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(floor_name ? [{ floor_name }] : []),
          ...(floor_number !== undefined ? [{ floor_number }] : [])
        ]
      });

      if (duplicateFloor) {
        return res.status(409).json({
          success: false,
          message: 'Floor name or number already exists'
        });
      }
    }

    // Update floor
    const updatedFloor = await Floor.findByIdAndUpdate(
      req.params.id,
      {
        ...(floor_name && { floor_name }),
        ...(floor_number !== undefined && { floor_number }),
        ...(description !== undefined && { description })
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Floor updated successfully',
      data: updatedFloor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating floor',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/floors/:id
 * @desc    Delete a floor
 * @access  Private (Manager/Admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    const floor = await Floor.findByIdAndDelete(req.params.id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    res.json({
      success: true,
      message: 'Floor deleted successfully',
      data: floor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting floor',
      error: error.message
    });
  }
});

module.exports = router;
