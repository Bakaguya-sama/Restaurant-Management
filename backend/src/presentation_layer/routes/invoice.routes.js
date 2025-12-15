const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoice/invoice.controller');

const invoiceController = new InvoiceController();

router.get('/statistics', (req, res) => invoiceController.getInvoiceStatistics(req, res));

router.get('/revenue', (req, res) => invoiceController.getRevenueByDateRange(req, res));

router.get('/number/:invoiceNumber', (req, res) => invoiceController.getInvoiceByInvoiceNumber(req, res));

router.get('/order/:orderId', (req, res) => invoiceController.getInvoiceByOrderId(req, res));

router.get('/', (req, res) => invoiceController.getAllInvoices(req, res));

router.get('/:id', (req, res) => invoiceController.getInvoiceById(req, res));

router.post('/', (req, res) => invoiceController.createInvoice(req, res));

router.put('/:id', (req, res) => invoiceController.updateInvoice(req, res));

router.delete('/:id', (req, res) => invoiceController.deleteInvoice(req, res));

router.patch('/:id/paid', (req, res) => invoiceController.markAsPaid(req, res));

router.patch('/:id/cancel', (req, res) => invoiceController.cancelInvoice(req, res));

module.exports = router;
