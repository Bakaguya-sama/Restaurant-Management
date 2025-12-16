const express = require('express');
const ReservationDetailController = require('../controllers/reservationdetail/reservationdetail.controller');

const router = express.Router();
const reservationDetailController = new ReservationDetailController();

router.get('/', (req, res) => reservationDetailController.getAllReservationDetails(req, res));
router.get('/:id', (req, res) => reservationDetailController.getReservationDetailById(req, res));
router.post('/', (req, res) => reservationDetailController.createReservationDetail(req, res));
router.put('/:id', (req, res) => reservationDetailController.updateReservationDetail(req, res));
router.delete('/:id', (req, res) => reservationDetailController.deleteReservationDetail(req, res));

module.exports = router;
