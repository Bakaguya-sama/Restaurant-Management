const express = require('express');
const router = express.Router();
const TableController = require('../controllers/table/table.controller');

const tableController = new TableController();

// GET all tables with optional filters
router.get('/', (req, res) => tableController.getAllTables(req, res));

// GET table status summary (must be before /:id and /status/:statusString)
router.get('/status/summary', (req, res) => tableController.getTableStatusSummary(req, res));

// GET tables by status
router.get('/status/:statusString', (req, res) => tableController.getTablesByStatus(req, res));

// GET tables by location
router.get('/location/:locationId', (req, res) => tableController.getTablesByLocation(req, res));

// GET table by ID
router.get('/:id', (req, res) => tableController.getTableById(req, res));

// POST create new table
router.post('/', (req, res) => tableController.createTable(req, res));

// PUT update table
router.put('/:id', (req, res) => tableController.updateTable(req, res));

// PATCH update table status
router.patch('/:id/status', (req, res) => tableController.updateTableStatus(req, res));

// DELETE table
router.delete('/:id', (req, res) => tableController.deleteTable(req, res));

module.exports = router;
