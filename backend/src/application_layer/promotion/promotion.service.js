const PromotionRepository = require('../../infrastructure_layer/promotion/promotion.repository');
const PromotionEntity = require('../../domain_layer/promotion/promotion.entity');

class PromotionService {
  constructor() {
    this.promotionRepository = new PromotionRepository();
  }

  async getAllPromotions(filters) {
    return await this.promotionRepository.findAll(filters);
  }

  async getPromotionById(id) {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    return promotion;
  }

  async getPromotionByPromoCode(promoCode) {
    const promotion = await this.promotionRepository.findByPromoCode(promoCode);
    if (!promotion) {
      throw new Error('Promotion code not found');
    }
    return promotion;
  }

  async validatePromoCode(promoCode, orderAmount) {
    const promotion = await this.promotionRepository.findByPromoCode(promoCode);
    
    if (!promotion) {
      throw new Error('Invalid promo code');
    }

    const promotionEntity = new PromotionEntity(promotion);

    if (!promotionEntity.isValidNow()) {
      throw new Error('Promo code is not valid at this time');
    }

    if (!promotionEntity.canBeUsed()) {
      throw new Error('Promo code has reached maximum uses');
    }

    if (orderAmount < promotion.minimum_order_amount) {
      throw new Error(`Minimum order amount is ${promotion.minimum_order_amount}`);
    }

    const discountAmount = promotionEntity.calculateDiscount(orderAmount);

    return {
      promotion: promotion,
      discount_amount: discountAmount,
      can_use: true
    };
  }

  async createPromotion(promotionData) {
    const promotionEntity = new PromotionEntity(promotionData);
    const validation = promotionEntity.validate();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    if (promotionData.promo_code) {
      const existingPromo = await this.promotionRepository.findByPromoCode(promotionData.promo_code);
      if (existingPromo) {
        throw new Error('Promo code already exists');
      }
    }

    return await this.promotionRepository.create(promotionData);
  }

  async updatePromotion(id, updateData) {
    const existingPromotion = await this.promotionRepository.findById(id);
    if (!existingPromotion) {
      throw new Error('Promotion not found');
    }

    if (updateData.is_active === true) {
      existingPromotion.validateIsActiveTransition(true);
    }

    if (updateData.promo_code && updateData.promo_code !== existingPromotion.promo_code) {
      const existingPromo = await this.promotionRepository.findByPromoCode(updateData.promo_code);
      if (existingPromo) {
        throw new Error('Promo code already exists');
      }
    }

    const updatedData = { ...existingPromotion.toJSON(), ...updateData };
    const promotionEntity = new PromotionEntity(updatedData);
    const validation = promotionEntity.validate();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return await this.promotionRepository.update(id, updateData);
  }

  async deletePromotion(id) {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    const result = await this.promotionRepository.delete(id);
    if (!result) {
      throw new Error('Failed to delete promotion');
    }

    return { message: 'Promotion deleted successfully' };
  }

  async activatePromotion(id) {
    const promotion = await this.promotionRepository.activate(id);
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    return promotion;
  }

  async deactivatePromotion(id) {
    const promotion = await this.promotionRepository.deactivate(id);
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    return promotion;
  }

  async incrementPromotionUses(id) {
    const promotion = await this.promotionRepository.incrementUses(id);
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    return promotion;
  }

  async getPromotionStatistics() {
    return await this.promotionRepository.getStatistics();
  }
}

module.exports = PromotionService;
