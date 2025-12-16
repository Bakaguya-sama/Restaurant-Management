const { InvoicePromotion, Invoice, Promotion } = require('../../models');
const InvoicePromotionEntity = require('../../domain_layer/invoice_promotion/invoice_promotion.entity');

class InvoicePromotionRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.invoice_id) {
      query.invoice_id = filters.invoice_id;
    }

    if (filters.promotion_id) {
      query.promotion_id = filters.promotion_id;
    }

    const invoicePromotions = await InvoicePromotion.find(query)
      .populate('invoice_id', 'invoice_number total_amount payment_status')
      .populate('promotion_id', 'name promo_code discount_value promotion_type')
      .lean();

    return invoicePromotions.map(ip => new InvoicePromotionEntity(ip).toJSON());
  }

  async findById(id) {
    const invoicePromotion = await InvoicePromotion.findById(id)
      .populate('invoice_id', 'invoice_number total_amount payment_status')
      .populate('promotion_id', 'name promo_code discount_value promotion_type')
      .lean();

    if (!invoicePromotion) {
      throw new Error('Invoice promotion not found');
    }

    return new InvoicePromotionEntity(invoicePromotion).toJSON();
  }

  async findByInvoiceId(invoiceId) {
    const invoicePromotions = await InvoicePromotion.find({ invoice_id: invoiceId })
      .populate('promotion_id', 'name promo_code discount_value promotion_type')
      .lean();

    return invoicePromotions.map(ip => new InvoicePromotionEntity(ip).toJSON());
  }

  async findByPromotionId(promotionId) {
    const invoicePromotions = await InvoicePromotion.find({ promotion_id: promotionId })
      .populate('invoice_id', 'invoice_number total_amount payment_status')
      .lean();

    return invoicePromotions.map(ip => new InvoicePromotionEntity(ip).toJSON());
  }

  async create(data) {
    const invoicePromotion = new InvoicePromotion(data);
    await invoicePromotion.save();

    return new InvoicePromotionEntity(invoicePromotion).toJSON();
  }

  async delete(id) {
    const result = await InvoicePromotion.findByIdAndDelete(id);

    if (!result) {
      throw new Error('Invoice promotion not found');
    }

    return { message: 'Invoice promotion deleted successfully' };
  }

  async getStatistics() {
    const total = await InvoicePromotion.countDocuments();

    const totalDiscount = await InvoicePromotion.aggregate([
      {
        $group: {
          _id: null,
          total_discount: { $sum: '$discount_applied' }
        }
      }
    ]);

    const byPromotion = await InvoicePromotion.aggregate([
      {
        $group: {
          _id: '$promotion_id',
          usage_count: { $sum: 1 },
          total_discount: { $sum: '$discount_applied' }
        }
      },
      {
        $lookup: {
          from: 'promotions',
          localField: '_id',
          foreignField: '_id',
          as: 'promotion'
        }
      },
      {
        $unwind: '$promotion'
      },
      {
        $project: {
          promotion_name: '$promotion.name',
          promo_code: '$promotion.promo_code',
          usage_count: 1,
          total_discount: 1
        }
      }
    ]);

    return {
      total,
      total_discount: totalDiscount[0]?.total_discount || 0,
      by_promotion: byPromotion
    };
  }
}

module.exports = InvoicePromotionRepository;
