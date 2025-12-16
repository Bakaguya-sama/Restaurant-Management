const express = require('express');
const OrderController = require('../controllers/order/order.controller');

const router = express.Router();
const orderController = new OrderController();

router.get('/', (req, res) => orderController.getAllOrders(req, res));
router.get('/statistics', (req, res) => orderController.getOrderStatistics(req, res));
router.get('/table/:tableId', (req, res) => orderController.getOrdersByTableId(req, res));
router.get('/customer/:customerId', (req, res) => orderController.getOrdersByCustomerId(req, res));
router.post('/', (req, res) => orderController.createOrder(req, res));

router.get('/:id', (req, res) => orderController.getOrderById(req, res));
router.put('/:id', (req, res) => orderController.updateOrder(req, res));
router.delete('/:id', (req, res) => orderController.deleteOrder(req, res));

router.post('/:id/calculate', (req, res) => orderController.calculateOrderTotal(req, res));

router.get('/:orderId/details', (req, res) => orderController.getOrderDetails(req, res));
router.post('/:orderId/details', (req, res) => orderController.addItemToOrder(req, res));

router.put('/:orderId/details/:detailId', (req, res) => orderController.updateOrderItem(req, res));
router.delete('/:orderId/details/:detailId', (req, res) => orderController.removeOrderItem(req, res));

module.exports = router;
