const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/promotion/promotion.controller');

const promotionController = new PromotionController();

router.get('/statistics', (req, res) => promotionController.getPromotionStatistics(req, res));

router.post('/validate', (req, res) => promotionController.validatePromoCode(req, res));

router.get('/code/:code', (req, res) => promotionController.getPromotionByPromoCode(req, res));

router.get('/', (req, res) => promotionController.getAllPromotions(req, res));

router.get('/:id', (req, res) => promotionController.getPromotionById(req, res));

router.post('/', (req, res) => promotionController.createPromotion(req, res));

router.put('/:id', (req, res) => promotionController.updatePromotion(req, res));

router.delete('/:id', (req, res) => promotionController.deletePromotion(req, res));

router.patch('/:id/activate', (req, res) => promotionController.activatePromotion(req, res));

router.patch('/:id/deactivate', (req, res) => promotionController.deactivatePromotion(req, res));

module.exports = router;
