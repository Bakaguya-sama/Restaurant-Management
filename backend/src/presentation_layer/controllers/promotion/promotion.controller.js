const PromotionService = require('../../../application_layer/promotion/promotion.service');

class PromotionController {
  constructor() {
    this.promotionService = new PromotionService();
  }

  async getAllPromotions(req, res) {
    try {
      const filters = {
        is_active: req.query.is_active,
        promotion_type: req.query.promotion_type,
        search: req.query.search,
        valid_now: req.query.valid_now
      };

      const promotions = await this.promotionService.getAllPromotions(filters);
      
      res.status(200).json({
        success: true,
        count: promotions.length,
        data: promotions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPromotionById(req, res) {
    try {
      const promotion = await this.promotionService.getPromotionById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: promotion
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPromotionByPromoCode(req, res) {
    try {
      const promotion = await this.promotionService.getPromotionByPromoCode(req.params.code);
      
      res.status(200).json({
        success: true,
        data: promotion
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async validatePromoCode(req, res) {
    try {
      const { promo_code, order_amount } = req.body;
      
      if (!promo_code || !order_amount) {
        return res.status(400).json({
          success: false,
          message: 'Promo code and order amount are required'
        });
      }

      const result = await this.promotionService.validatePromoCode(promo_code, order_amount);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async createPromotion(req, res) {
    try {
      const promotion = await this.promotionService.createPromotion(req.body);
      
      res.status(201).json({
        success: true,
        data: promotion
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePromotion(req, res) {
    try {
      const promotion = await this.promotionService.updatePromotion(req.params.id, req.body);
      
      res.status(200).json({
        success: true,
        data: promotion
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deletePromotion(req, res) {
    try {
      const result = await this.promotionService.deletePromotion(req.params.id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async activatePromotion(req, res) {
    try {
      const promotion = await this.promotionService.activatePromotion(req.params.id);
      
      res.status(200).json({
        success: true,
        data: promotion
      });
    } catch (error) {
      if (error.message === 'Promotion expired and user should change end date first') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async deactivatePromotion(req, res) {
    try {
      const promotion = await this.promotionService.deactivatePromotion(req.params.id);
      
      res.status(200).json({
        success: true,
        data: promotion
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPromotionStatistics(req, res) {
    try {
      const statistics = await this.promotionService.getPromotionStatistics();
      
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = PromotionController;
