const express = require('express');
const router = express.Router();
const FloorController = require('../controllers/floor/floor.controller');

const floorController = new FloorController();

// GET all floors
router.get('/', (req, res) => floorController.getAllFloors(req, res));

// GET floor by ID
router.get('/:id', (req, res) => floorController.getFloorById(req, res));

// POST create new floor
router.post('/', (req, res) => floorController.createFloor(req, res));

// PUT update floor
router.put('/:id', (req, res) => floorController.updateFloor(req, res));

// DELETE floor
router.delete('/:id', (req, res) => floorController.deleteFloor(req, res));

module.exports = router;
