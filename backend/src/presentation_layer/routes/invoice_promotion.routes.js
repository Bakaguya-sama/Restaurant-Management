const express = require('express');
const router = express.Router();
const InvoicePromotionController = require('../controllers/invoice_promotion/invoice_promotion.controller');

const invoicePromotionController = new InvoicePromotionController();

router.get('/statistics', (req, res) => invoicePromotionController.getInvoicePromotionStatistics(req, res));
router.get('/invoice/:invoiceId', (req, res) => invoicePromotionController.getPromotionsByInvoiceId(req, res));
router.get('/promotion/:promotionId', (req, res) => invoicePromotionController.getInvoicesByPromotionId(req, res));
router.get('/:id', (req, res) => invoicePromotionController.getInvoicePromotionById(req, res));
router.get('/', (req, res) => invoicePromotionController.getAllInvoicePromotions(req, res));
router.post('/', (req, res) => invoicePromotionController.createInvoicePromotion(req, res));
router.delete('/:id', (req, res) => invoicePromotionController.deleteInvoicePromotion(req, res));

module.exports = router;
