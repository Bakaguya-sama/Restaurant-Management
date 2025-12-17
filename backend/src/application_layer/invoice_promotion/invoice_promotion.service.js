const InvoicePromotionRepository = require('../../infrastructure_layer/invoice_promotion/invoice_promotion.repository');
const InvoicePromotionEntity = require('../../domain_layer/invoice_promotion/invoice_promotion.entity');
const { Invoice, Promotion } = require('../../models');

class InvoicePromotionService {
  constructor() {
    this.invoicePromotionRepository = new InvoicePromotionRepository();
  }

  async getAllInvoicePromotions(filters) {
    return await this.invoicePromotionRepository.findAll(filters);
  }

  async getInvoicePromotionById(id) {
    return await this.invoicePromotionRepository.findById(id);
  }

  async getPromotionsByInvoiceId(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return await this.invoicePromotionRepository.findByInvoiceId(invoiceId);
  }

  async getInvoicesByPromotionId(promotionId) {
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    return await this.invoicePromotionRepository.findByPromotionId(promotionId);
  }

  async createInvoicePromotion(data) {
    const invoicePromotionEntity = new InvoicePromotionEntity(data);
    const validation = invoicePromotionEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const invoice = await Invoice.findById(data.invoice_id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const promotion = await Promotion.findById(data.promotion_id);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    const existing = await this.invoicePromotionRepository.findByInvoiceId(data.invoice_id);
    const alreadyApplied = existing.find(ip => ip.promotion_id.toString() === data.promotion_id.toString());
    
    if (alreadyApplied) {
      throw new Error('This promotion is already applied to this invoice');
    }

    return await this.invoicePromotionRepository.create(data);
  }

  async deleteInvoicePromotion(id) {
    return await this.invoicePromotionRepository.delete(id);
  }

  async getInvoicePromotionStatistics() {
    return await this.invoicePromotionRepository.getStatistics();
  }
}

module.exports = InvoicePromotionService;
