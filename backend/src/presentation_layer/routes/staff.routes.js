const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staff/staff.controller');

const staffController = new StaffController();

router.post('/login', (req, res) => staffController.loginStaff(req, res));

router.get('/statistics', (req, res) => staffController.getStaffStatistics(req, res));

router.get('/', (req, res) => staffController.getAllStaff(req, res));

router.get('/:id', (req, res) => staffController.getStaffById(req, res));

router.post('/', (req, res) => staffController.createStaff(req, res));

router.put('/:id', (req, res) => staffController.updateStaff(req, res));

router.delete('/:id', (req, res) => staffController.deleteStaff(req, res));

router.patch('/:id/deactivate', (req, res) => staffController.deactivateStaff(req, res));

router.patch('/:id/activate', (req, res) => staffController.activateStaff(req, res));

module.exports = router;
