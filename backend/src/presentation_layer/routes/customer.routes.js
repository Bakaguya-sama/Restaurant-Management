const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer/customer.controller');

const customerController = new CustomerController();

router.post('/login', (req, res) => customerController.loginCustomer(req, res));

router.get('/statistics', (req, res) => customerController.getCustomerStatistics(req, res));

router.get('/top', (req, res) => customerController.getTopCustomers(req, res));

router.get('/', (req, res) => customerController.getAllCustomers(req, res));

router.get('/:id', (req, res) => customerController.getCustomerById(req, res));

router.post('/', (req, res) => customerController.createCustomer(req, res));

router.put('/:id', (req, res) => customerController.updateCustomer(req, res));

router.delete('/:id', (req, res) => customerController.deleteCustomer(req, res));

router.patch('/:id/ban', (req, res) => customerController.banCustomer(req, res));

router.patch('/:id/unban', (req, res) => customerController.unbanCustomer(req, res));

router.patch('/:id/points', (req, res) => customerController.addPoints(req, res));

router.patch('/:id/spending', (req, res) => customerController.addSpending(req, res));

module.exports = router;
