const express = require('express');
const router = express.Router();
const ViolationController = require('../controllers/violation/violation.controller');

const violationController = new ViolationController();

router.get('/statistics/top-violators', (req, res) => violationController.getTopViolators(req, res));
router.get('/statistics', (req, res) => violationController.getViolationStatistics(req, res));
router.get('/customer/:customerId', (req, res) => violationController.getViolationsByCustomerId(req, res));
router.get('/:id', (req, res) => violationController.getViolationById(req, res));
router.get('/', (req, res) => violationController.getAllViolations(req, res));
router.post('/', (req, res) => violationController.createViolation(req, res));
router.put('/:id', (req, res) => violationController.updateViolation(req, res));
router.delete('/:id', (req, res) => violationController.deleteViolation(req, res));

module.exports = router;
