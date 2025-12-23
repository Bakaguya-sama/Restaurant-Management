const InvoiceRepository = require('../../infrastructure_layer/invoice/invoice.repository');
const PromotionService = require('../promotion/promotion.service');
const InvoiceEntity = require('../../domain_layer/invoice/invoice.entity');
const { Order, User } = require('../../models');

class InvoiceService {
  constructor() {
    this.invoiceRepository = new InvoiceRepository();
    this.promotionService = new PromotionService();
  }

  async getAllInvoices(filters) {
    return await this.invoiceRepository.findAll(filters);
  }

  async getInvoiceById(id) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async getInvoiceByInvoiceNumber(invoiceNumber) {
    const invoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async getInvoiceByOrderId(orderId) {
    const invoice = await this.invoiceRepository.findByOrderId(orderId);
    if (!invoice) {
      throw new Error('Invoice not found for this order');
    }
    return invoice;
  }

  async createInvoice(invoiceData) {
    const order = await Order.findById(invoiceData.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    const staff = await User.findById(invoiceData.staff_id);
    if (!staff) {
      throw new Error('Staff not found');
    }

    if (!['waiter', 'cashier', 'manager'].includes(staff.role)) {
      throw new Error('User is not a staff member');
    }

    const existingInvoice = await this.invoiceRepository.findByOrderId(invoiceData.order_id);
    if (existingInvoice) {
      throw new Error('Invoice already exists for this order');
    }

    if (!invoiceData.invoice_number) {
      invoiceData.invoice_number = await this.generateInvoiceNumber();
    }

    let discountAmount = 0;
    let promotionIds = [];

    if (invoiceData.promo_codes && invoiceData.promo_codes.length > 0) {
      for (const promoCode of invoiceData.promo_codes) {
        const validation = await this.promotionService.validatePromoCode(
          promoCode,
          invoiceData.subtotal
        );
        
        discountAmount += validation.discount_amount;
        promotionIds.push({
          id: validation.promotion.id,
          discount: validation.discount_amount
        });
      }
    }

    const taxRate = invoiceData.tax_rate || 0;
    const totals = new InvoiceEntity({}).calculateTotals(
      invoiceData.subtotal,
      taxRate,
      discountAmount
    );

    const finalInvoiceData = {
      invoice_number: invoiceData.invoice_number,
      order_id: invoiceData.order_id,
      staff_id: invoiceData.staff_id,
      customer_id: invoiceData.customer_id || order.customer_id,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount_amount: totals.discount_amount,
      total_amount: totals.total_amount,
      payment_method: invoiceData.payment_method,
      payment_status: invoiceData.payment_status || 'pending'
    };

    const invoiceEntity = new InvoiceEntity(finalInvoiceData);
    const validation = invoiceEntity.validate();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const invoice = await this.invoiceRepository.create(finalInvoiceData);

    for (const promo of promotionIds) {
      await this.invoiceRepository.addPromotion(invoice.id, promo.id, promo.discount);
      await this.promotionService.incrementPromotionUses(promo.id);
    }

    return await this.invoiceRepository.findById(invoice.id);
  }

  async updateInvoice(id, updateData) {
    const existingInvoice = await this.invoiceRepository.findById(id);
    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }

    if (existingInvoice.payment_status === 'paid') {
      throw new Error('Cannot update paid invoice');
    }

    return await this.invoiceRepository.update(id, updateData);
  }

  async deleteInvoice(id) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.payment_status === 'paid') {
      throw new Error('Cannot delete paid invoice');
    }

    const result = await this.invoiceRepository.delete(id);
    if (!result) {
      throw new Error('Failed to delete invoice');
    }

    return { message: 'Invoice deleted successfully' };
  }

  async applyPromotionToInvoice(id, promotionId) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.payment_status === 'paid') {
      throw new Error('Cannot apply promotion to paid invoice');
    }

    if (invoice.payment_status === 'cancelled') {
      throw new Error('Cannot apply promotion to cancelled invoice');
    }

    // Validate promotion
    const promotion = await this.promotionService.getPromotionById(promotionId);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    const validation = await this.promotionService.validatePromoCode(
      promotion.promo_code,
      invoice.subtotal
    );

    // Calculate new discount and total
    let discountAmount = validation.discount_amount;
    const newTotal = invoice.subtotal + invoice.tax - discountAmount;

    // Update invoice
    const updateData = {
      discount_amount: discountAmount,
      total_amount: newTotal
    };

    const updatedInvoice = await this.invoiceRepository.update(id, updateData);

    // Clear old promotions and add new one
    await this.invoiceRepository.clearPromotions(id);
    await this.invoiceRepository.addPromotion(id, promotionId, discountAmount);
    await this.promotionService.incrementPromotionUses(promotionId);

    return await this.invoiceRepository.findById(id);
  }

  async markAsPaid(id, paymentMethod, promotionId = null) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.payment_status === 'paid') {
      throw new Error('Invoice is already paid');
    }

    if (invoice.payment_status === 'cancelled') {
      throw new Error('Cannot mark cancelled invoice as paid');
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }

    const validPaymentMethods = ['cash', 'card', 'transfer', 'e-wallet'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    // Apply promotion if provided
    if (promotionId) {
      await this.applyPromotionToInvoice(id, promotionId);
    }

    return await this.invoiceRepository.updatePaymentStatus(id, 'paid', new Date(), paymentMethod);
  }

  async cancelInvoice(id) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.payment_status === 'paid') {
      throw new Error('Cannot cancel paid invoice');
    }

    return await this.invoiceRepository.updatePaymentStatus(id, 'cancelled');
  }

  async getInvoiceStatistics() {
    return await this.invoiceRepository.getStatistics();
  }

  async getRevenueByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    return await this.invoiceRepository.getRevenueByDateRange(startDate, endDate);
  }

  async generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const prefix = `INV-${year}${month}${day}`;
    
    const lastInvoice = await this.invoiceRepository.findAll({
      search: prefix
    });

    const sequence = lastInvoice.length + 1;
    const invoiceNumber = `${prefix}-${String(sequence).padStart(4, '0')}`;

    return invoiceNumber;
  }
}

module.exports = InvoiceService;
