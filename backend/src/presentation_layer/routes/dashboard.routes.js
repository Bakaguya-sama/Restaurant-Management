const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard/dashboard.controller');

const dashboardController = new DashboardController();

// Get dashboard statistics by date range
router.get('/statistics', (req, res) => dashboardController.getDashboardStatistics(req, res));

// Get inventory alerts
router.get('/inventory-alerts', (req, res) => dashboardController.getInventoryAlerts(req, res));

// Get customer statistics
router.get('/customer-statistics', (req, res) => dashboardController.getCustomerStatistics(req, res));

// Get recent feedback
router.get('/recent-feedback', (req, res) => dashboardController.getRecentFeedback(req, res));

module.exports = router;
