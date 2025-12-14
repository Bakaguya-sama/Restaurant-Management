const express = require('express');
const router = express.Router();
const { Location, Floor, Table } = require('../models');

// GET all locations with optional floor filter
router.get('/', async (req, res) => {
  try {
    const { floor } = req.query;
    
    let query = {};
    if (floor) {
      const floorDoc = await Floor.findOne({ floor_name: floor });
      if (floorDoc) {
        query.floor_id = floorDoc._id;
      }
    }

    const locations = await Location.find(query)
      .populate('floor_id', 'floor_name')
      .select('_id name floor_id description created_at');
    
    const formattedLocations = locations.map(location => ({
      id: location._id,
      name: location.name,
      floor: location.floor_id ? location.floor_id.floor_name : null,
      floor_id: location.floor_id ? location.floor_id._id : null,
      description: location.description,
      createdAt: location.created_at
    }));

    res.json({
      success: true,
      data: formattedLocations,
      message: 'Locations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error fetching locations'
    });
  }
});

// GET location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('floor_id', 'floor_name')
      .select('_id name floor_id description created_at');
    
    if (!location) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: location._id,
        name: location.name,
        floor: location.floor_id ? location.floor_id.floor_name : null,
        floor_id: location.floor_id ? location.floor_id._id : null,
        description: location.description,
        createdAt: location.created_at
      },
      message: 'Location retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error fetching location'
    });
  }
});

// POST create new location
router.post('/', async (req, res) => {
  try {
    const { name, floor, description } = req.body;

    // Validation
    if (!name || !floor) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'name and floor are required'
      });
    }

    // Check if floor exists by _id
    const floorDoc = await Floor.findById(floor);
    if (!floorDoc) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Floor not found'
      });
    }

    // Check if location with same name already exists
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Location with this name already exists'
      });
    }

    const location = new Location({
      name,
      floor_id: floorDoc._id,
      description: description || ''
    });

    const savedLocation = await location.save();
    await savedLocation.populate('floor_id', 'floor_name');

    res.status(201).json({
      success: true,
      data: {
        id: savedLocation._id,
        name: savedLocation.name,
        floor: savedLocation.floor_id ? savedLocation.floor_id.floor_name : null,
        floor_id: savedLocation.floor_id ? savedLocation.floor_id._id : null,
        description: savedLocation.description,
        createdAt: savedLocation.created_at
      },
      message: 'Location created successfully'
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error creating location'
    });
  }
});

// PUT update location
router.put('/:id', async (req, res) => {
  try {
    const { name, floor, description } = req.body;

    // Validation
    if (!name || !floor) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'name and floor are required'
      });
    }

    // Check if floor exists by _id
    const floorDoc = await Floor.findById(floor);
    if (!floorDoc) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Floor not found'
      });
    }

    // Check if another location already has this name
    const existingLocation = await Location.findOne({
      _id: { $ne: req.params.id },
      name
    });

    if (existingLocation) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Location name already exists'
      });
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      { name, floor_id: floorDoc._id, description: description || '' },
      { new: true }
    ).populate('floor_id', 'floor_name')
     .select('_id name floor_id description created_at');

    if (!updatedLocation) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedLocation._id,
        name: updatedLocation.name,
        floor: updatedLocation.floor_id ? updatedLocation.floor_id.floor_name : null,
        description: updatedLocation.description,
        createdAt: updatedLocation.created_at
      },
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error updating location'
    });
  }
});

// DELETE location
router.delete('/:id', async (req, res) => {
  try {
    const attachedTables = await Table.findOne({ location_id: req.params.id });
    if (attachedTables) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Cannot delete location with attached tables'
      });
    }

    const deletedLocation = await Location.findByIdAndDelete(req.params.id)
      .populate('floor_id', 'floor_name')
      .select('_id name floor_id description created_at');

    if (!deletedLocation) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: deletedLocation._id,
        name: deletedLocation.name,
        floor: deletedLocation.floor_id ? deletedLocation.floor_id.floor_name : null,
        description: deletedLocation.description,
        createdAt: deletedLocation.created_at
      },
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error deleting location'
    });
  }
});

module.exports = router;
