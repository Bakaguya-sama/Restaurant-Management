const { Promotion } = require('../../models');
const PromotionEntity = require('../../domain_layer/promotion/promotion.entity');

class PromotionRepository {
  async syncPromotionState(promotionDoc) {
    const entity = new PromotionEntity(promotionDoc.toObject());
    if (entity.isExpired() && promotionDoc.is_active) {
      await Promotion.findByIdAndUpdate(
        promotionDoc._id,
        { is_active: false },
        { new: false }
      );
      promotionDoc.is_active = false;
    }
    return entity;
  }

  async findAll(filters = {}) {
    const query = {};
    
    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    if (filters.promotion_type) {
      query.promotion_type = filters.promotion_type;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { promo_code: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.valid_now) {
      const now = new Date();
      query.is_active = true;
      query.start_date = { $lte: now };
      query.end_date = { $gte: now };
    }

    const promotions = await Promotion.find(query).sort({ created_at: -1 });
    const syncedPromotions = [];
    for (const promotion of promotions) {
      const synced = await this.syncPromotionState(promotion);
      syncedPromotions.push(synced);
    }
    return syncedPromotions;
  }

  async findById(id) {
    const promotion = await Promotion.findById(id);
    if (!promotion) return null;
    return await this.syncPromotionState(promotion);
  }

  async findByPromoCode(promoCode) {
    const promotion = await Promotion.findOne({ promo_code: promoCode });
    if (!promotion) return null;
    return await this.syncPromotionState(promotion);
  }

  async create(promotionData) {
    const promotion = new Promotion(promotionData);
    const savedPromotion = await promotion.save();
    return new PromotionEntity(savedPromotion.toObject());
  }

  async update(id, updateData) {
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!promotion) return null;
    return await this.syncPromotionState(promotion);
  }

  async delete(id) {
    const promotion = await Promotion.findByIdAndDelete(id);
    return promotion !== null;
  }

  async activate(id) {
    const promotion = await Promotion.findById(id);
    if (!promotion) return null;
    
    const entity = new PromotionEntity(promotion.toObject());
    entity.validateIsActiveTransition(true);
    
    const updated = await Promotion.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true }
    );
    
    if (!updated) return null;
    return await this.syncPromotionState(updated);
  }

  async deactivate(id) {
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );
    
    if (!promotion) return null;
    return await this.syncPromotionState(promotion);
  }

  async incrementUses(id) {
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $inc: { current_uses: 1 } },
      { new: true }
    );
    
    if (!promotion) return null;
    return await this.syncPromotionState(promotion);
  }

  async getStatistics() {
    const totalPromotions = await Promotion.countDocuments();
    const activePromotions = await Promotion.countDocuments({ is_active: true });
    
    const now = new Date();
    const validPromotions = await Promotion.countDocuments({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now }
    });

    const expiredPromotions = await Promotion.countDocuments({
      end_date: { $lt: now }
    });

    return {
      total: totalPromotions,
      active: activePromotions,
      valid: validPromotions,
      expired: expiredPromotions
    };
  }
}

module.exports = PromotionRepository;
