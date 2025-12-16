const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaint/complaint.controller');

const complaintController = new ComplaintController();

router.get('/statistics', (req, res) => complaintController.getComplaintStatistics(req, res));
router.get('/:id', (req, res) => complaintController.getComplaintById(req, res));
router.get('/', (req, res) => complaintController.getAllComplaints(req, res));
router.post('/', (req, res) => complaintController.createComplaint(req, res));
router.put('/:id', (req, res) => complaintController.updateComplaint(req, res));
router.patch('/:id/status', (req, res) => complaintController.updateComplaintStatus(req, res));
router.patch('/:id/assign', (req, res) => complaintController.assignComplaintToStaff(req, res));
router.patch('/:id/resolve', (req, res) => complaintController.resolveComplaint(req, res));
router.delete('/:id', (req, res) => complaintController.deleteComplaint(req, res));

module.exports = router;
