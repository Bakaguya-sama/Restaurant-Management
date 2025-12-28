const express = require('express');
const ReservationController = require('../controllers/reservation/reservation.controller');

const router = express.Router();
const reservationController = new ReservationController();

// Specific routes must come BEFORE generic :id routes
router.get('/statistics', (req, res) => reservationController.getReservationStatistics(req, res));
router.get('/customer/:customerId', (req, res) => reservationController.getReservationsByCustomerId(req, res));
router.get('/table/:tableId', (req, res) => reservationController.getReservationsByTableId(req, res));

// Generic routes
router.get('/', (req, res) => reservationController.getAllReservations(req, res));
router.post('/', (req, res) => reservationController.createReservation(req, res));
router.get('/:id', (req, res) => reservationController.getReservationById(req, res));
router.patch('/:id/status', (req, res) => reservationController.updateReservationStatus(req, res));
router.put('/:id', (req, res) => reservationController.updateReservation(req, res));
router.delete('/:id', (req, res) => reservationController.deleteReservation(req, res));

// Detail operations
router.post('/:id/add-table', (req, res) => reservationController.addTableToReservation(req, res));
router.delete('/:id/remove-table/:tableId', (req, res) => reservationController.removeTableFromReservation(req, res));

module.exports = router;
