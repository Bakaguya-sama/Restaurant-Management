const InvoicePromotionService = require('../../../application_layer/invoice_promotion/invoice_promotion.service');

class InvoicePromotionController {
  constructor() {
    this.invoicePromotionService = new InvoicePromotionService();
  }

  async getAllInvoicePromotions(req, res) {
    try {
      const filters = {
        invoice_id: req.query.invoice_id,
        promotion_id: req.query.promotion_id
      };

      const invoicePromotions = await this.invoicePromotionService.getAllInvoicePromotions(filters);

      res.status(200).json({
        success: true,
        count: invoicePromotions.length,
        data: invoicePromotions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getInvoicePromotionById(req, res) {
    try {
      const invoicePromotion = await this.invoicePromotionService.getInvoicePromotionById(req.params.id);

      res.status(200).json({
        success: true,
        data: invoicePromotion
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPromotionsByInvoiceId(req, res) {
    try {
      const promotions = await this.invoicePromotionService.getPromotionsByInvoiceId(req.params.invoiceId);

      res.status(200).json({
        success: true,
        count: promotions.length,
        data: promotions
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getInvoicesByPromotionId(req, res) {
    try {
      const invoices = await this.invoicePromotionService.getInvoicesByPromotionId(req.params.promotionId);

      res.status(200).json({
        success: true,
        count: invoices.length,
        data: invoices
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createInvoicePromotion(req, res) {
    try {
      const invoicePromotion = await this.invoicePromotionService.createInvoicePromotion(req.body);

      res.status(201).json({
        success: true,
        data: invoicePromotion
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteInvoicePromotion(req, res) {
    try {
      const result = await this.invoicePromotionService.deleteInvoicePromotion(req.params.id);

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

  async getInvoicePromotionStatistics(req, res) {
    try {
      const statistics = await this.invoicePromotionService.getInvoicePromotionStatistics();

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

module.exports = InvoicePromotionController;
