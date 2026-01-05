const InvoiceRepository = require('../../infrastructure_layer/invoice/invoice.repository');
const PromotionService = require('../promotion/promotion.service');
const InvoicePointsService = require('./invoice-points.service');
const InvoiceEntity = require('../../domain_layer/invoice/invoice.entity');
const { Order, User } = require('../../models');

class InvoiceService {
  constructor() {
    this.invoiceRepository = new InvoiceRepository();
    this.promotionService = new PromotionService();
    this.pointsService = new InvoicePointsService();
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

    // ⭐ TRỪ NGUYÊN LIỆU KHI TẠO HÓA ĐƠN
    // Get all order details (không bao gồm món cancelled)
    const { OrderDetail } = require('../../models');
    const OrderDetailService = require('../orderdetail/orderdetail.service');
    const orderDetailService = new OrderDetailService();
    
    const orderDetails = await OrderDetail.find({ 
      order_id: invoiceData.order_id,
      status: { $ne: 'cancelled' }
    });
    
    console.log(`Trừ nguyên liệu cho ${orderDetails.length} món trong order ${invoiceData.order_id}`);
    
    // Trừ nguyên liệu cho từng món
    for (const detail of orderDetails) {
      try {
        await orderDetailService.deductIngredientsForDish(
          detail.dish_id,
          detail.quantity,
          invoiceData.order_id
        );
      } catch (error) {
        console.error(`Lỗi khi trừ nguyên liệu cho món ${detail.dish_id}:`, error.message);
        throw new Error(`Không thể tạo hóa đơn: ${error.message}`);
      }
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

    
    let pointsUsed = invoiceData.points_used || 0;
    let pointsEarned = invoiceData.points_earned || 0;

    
    if (invoiceData.customer_id) {
      if (pointsUsed > 0) {
        const pointsValidation = await this.pointsService.validatePointsForRedeeming(
          invoiceData.customer_id,
          pointsUsed
        );
        if (!pointsValidation.isValid) {
          throw new Error(pointsValidation.message);
        }
        discountAmount += pointsUsed;
      }

      if (!invoiceData.points_earned) {
        pointsEarned = this.pointsService.calculatePointsEarned(invoiceData.subtotal + invoiceData.tax);
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
      payment_status: invoiceData.payment_status || 'pending',
      points_used: pointsUsed,
      points_earned: pointsEarned
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

    
    const promotion = await this.promotionService.getPromotionById(promotionId);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    const validation = await this.promotionService.validatePromoCode(
      promotion.promo_code,
      invoice.subtotal
    );

    
    let discountAmount = validation.discount_amount;
    const newTotal = invoice.subtotal + invoice.tax - discountAmount;

    
    const updateData = {
      discount_amount: discountAmount,
      total_amount: newTotal
    };

    const updatedInvoice = await this.invoiceRepository.update(id, updateData);

    
    await this.invoiceRepository.clearPromotions(id);
    await this.invoiceRepository.addPromotion(id, promotionId, discountAmount);
    await this.promotionService.incrementPromotionUses(promotionId);

    return await this.invoiceRepository.findById(id);
  }

  async markAsPaid(id, paymentMethod, promotionId = null, pointsUsed = 0) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.isPaid()) {
      throw new Error('Invoice is already paid');
    }

    if (invoice.isCancelled()) {
      throw new Error('Cannot mark cancelled invoice as paid');
    }

    let discountAmount = invoice.discount_amount || 0;
    let totalAmount = invoice.total_amount;

    if (promotionId) {
      const promotion = await this.promotionService.getPromotionById(promotionId);
      if (!promotion) {
        throw new Error('Promotion not found');
      }

      const promotionEntity = require('../../domain_layer/promotion/promotion.entity');
      const promoEntity = new promotionEntity(promotion);
      
      if (!promoEntity.isValidNow()) {
        throw new Error('Promo code is not valid at this time');
      }

      if (!promoEntity.canBeUsed()) {
        throw new Error('Promo code has reached maximum uses');
      }

      if (invoice.subtotal < promotion.minimum_order_amount) {
        throw new Error(`Minimum order amount is ${promotion.minimum_order_amount}`);
      }

      discountAmount = promoEntity.calculateDiscount(invoice.subtotal);
      totalAmount = invoice.subtotal + invoice.tax - discountAmount - (pointsUsed || 0);

      await this.invoiceRepository.addPromotion(id, promotionId, discountAmount);
      
      await this.promotionService.incrementPromotionUses(promotionId);
    } else {
      totalAmount = invoice.subtotal + invoice.tax - (pointsUsed || 0);
    }

    let pointsEarned = 0;
    if (pointsUsed === 0) {
      pointsEarned = Math.floor((invoice.subtotal + invoice.tax) / 100) * 10;
    }

    const updateData = {
      payment_method: paymentMethod,
      payment_status: 'paid',
      paid_at: new Date(),
      discount_amount: discountAmount,
      total_amount: totalAmount,
      points_used: pointsUsed || 0,
      points_earned: pointsEarned
    };

    await this.invoiceRepository.update(id, updateData);

    // Redeem points if used
    if (invoice.customer_id && pointsUsed > 0) {
      try {
        await this.pointsService.redeemCustomerPoints(invoice.customer_id, pointsUsed);
      } catch (error) {
        console.error('Failed to redeem points:', error);
      }
    }

    if (invoice.customer_id && pointsEarned > 0 && pointsUsed === 0) {
      try {
        await this.pointsService.awardCustomerPoints(invoice.customer_id, pointsEarned);
      } catch (error) {
        console.error('Failed to award points:', error);
      }
    }

    
    if (invoice.customer_id && totalAmount > 0) {
      try {
        const { Customer } = require('../../models');
        const customer = await Customer.findById(invoice.customer_id);
        
        if (customer) {
          const oldTotal = customer.total_spent || 0;
          customer.total_spent = oldTotal + totalAmount;
          
          const newTotal = customer.total_spent;
          let newMembershipLevel = 'regular';
          
          if (newTotal >= 50000000) {
            newMembershipLevel = 'diamond';
          } else if (newTotal >= 30000000) {
            newMembershipLevel = 'platinum';
          } else if (newTotal >= 15000000) {
            newMembershipLevel = 'gold';
          } else if (newTotal >= 5000000) {
            newMembershipLevel = 'silver';
          } else if (newTotal >= 1000000) {
            newMembershipLevel = 'bronze';
          }
          
          if (customer.membership_level !== newMembershipLevel) {
            console.log(`📈 Membership upgrade: ${customer.membership_level} → ${newMembershipLevel}`);
            customer.membership_level = newMembershipLevel;
          }
          
          await customer.save();
          console.log(`✅ Updated customer ${invoice.customer_id} total_spent: ${oldTotal} + ${totalAmount} = ${customer.total_spent}, level: ${customer.membership_level}`);
        } else {
          console.log('❌ Customer not found!');
        }
      } catch (error) {
        console.error('❌ Failed to update customer total_spent:', error);
      }
    } else {
      console.log('❌ Skipped total_spent update - missing customer_id or totalAmount <= 0');
    }
    console.log('=== END UPDATE TOTAL_SPENT DEBUG ===');

    return await this.invoiceRepository.findById(id);
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
