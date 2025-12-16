const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/location/location.controller');

const locationController = new LocationController();

// GET all locations with optional floor filter
router.get('/', (req, res) => locationController.getAllLocations(req, res));

// GET locations by floor ID (must be before /:id)
router.get('/floor/:floorId', (req, res) => locationController.getLocationsByFloor(req, res));

// GET location by ID
router.get('/:id', (req, res) => locationController.getLocationById(req, res));

// POST create new location
router.post('/', (req, res) => locationController.createLocation(req, res));

// PUT update location
router.put('/:id', (req, res) => locationController.updateLocation(req, res));

// DELETE location
router.delete('/:id', (req, res) => locationController.deleteLocation(req, res));

module.exports = router;
