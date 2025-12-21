const { Invoice, InvoicePromotion, Order } = require('../../models');
const InvoiceEntity = require('../../domain_layer/invoice/invoice.entity');

class InvoiceRepository {
  async findAll(filters = {}) {
    const query = {};
    
    if (filters.payment_status) {
      query.payment_status = filters.payment_status;
    }

    if (filters.payment_method) {
      query.payment_method = filters.payment_method;
    }

    if (filters.customer_id) {
      query.customer_id = filters.customer_id;
    }

    if (filters.staff_id) {
      query.staff_id = filters.staff_id;
    }

    if (filters.start_date && filters.end_date) {
      query.invoice_date = {
        $gte: new Date(filters.start_date),
        $lte: new Date(filters.end_date)
      };
    }

    if (filters.search) {
      query.invoice_number = { $regex: filters.search, $options: 'i' };
    }

    const { OrderDetail, Table } = require('../../models');
    const invoices = await Invoice.find(query)
      .populate({
        path: 'order_id',
        select: 'order_number order_type status table_id'
      })
      .populate('staff_id', 'full_name email role')
      .populate('customer_id', 'full_name email phone')
      .sort({ created_at: -1 });

    const enrichedInvoices = await Promise.all(invoices.map(async (invoice) => {
      const invoiceObj = invoice.toObject();
      if (invoiceObj.order_id) {
        const orderDetails = await OrderDetail.find({ order_id: invoiceObj.order_id._id })
          .populate('dish_id', 'name price');
        invoiceObj.order_id.items = orderDetails;
        
        if (invoiceObj.order_id.table_id) {
          const table = await Table.findById(invoiceObj.order_id.table_id);
          if (table) {
            invoiceObj.order_id.table = table;
          }
        }
      }
      return new InvoiceEntity(invoiceObj);
    }));

    return enrichedInvoices;
  }

  async findById(id) {
    const invoice = await Invoice.findById(id)
      .populate('order_id')
      .populate('staff_id', 'full_name email role')
      .populate('customer_id', 'full_name email phone');

    if (!invoice) return null;

    const invoiceObj = invoice.toObject();
    
    const promotions = await InvoicePromotion.find({ invoice_id: id })
      .populate('promotion_id');
    
    invoiceObj.promotions = promotions;

    return new InvoiceEntity(invoiceObj);
  }

  async findByInvoiceNumber(invoiceNumber) {
    const invoice = await Invoice.findOne({ invoice_number: invoiceNumber })
      .populate('order_id')
      .populate('staff_id', 'full_name email role')
      .populate('customer_id', 'full_name email phone');

    if (!invoice) return null;
    return new InvoiceEntity(invoice.toObject());
  }

  async findByOrderId(orderId) {
    const invoice = await Invoice.findOne({ order_id: orderId })
      .populate('order_id')
      .populate('staff_id', 'full_name email role')
      .populate('customer_id', 'full_name email phone');

    if (!invoice) return null;
    return new InvoiceEntity(invoice.toObject());
  }

  async create(invoiceData) {
    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();
    return new InvoiceEntity(savedInvoice.toObject());
  }

  async update(id, updateData) {
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('order_id')
    .populate('staff_id', 'full_name email role')
    .populate('customer_id', 'full_name email phone');
    
    if (!invoice) return null;
    return new InvoiceEntity(invoice.toObject());
  }

  async delete(id) {
    await InvoicePromotion.deleteMany({ invoice_id: id });
    const invoice = await Invoice.findByIdAndDelete(id);
    return invoice !== null;
  }

  async updatePaymentStatus(id, status, paidAt = null) {
    const updateData = { payment_status: status };
    if (paidAt) {
      updateData.paid_at = paidAt;
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!invoice) return null;
    return new InvoiceEntity(invoice.toObject());
  }

  async addPromotion(invoiceId, promotionId, discountApplied) {
    const invoicePromotion = new InvoicePromotion({
      invoice_id: invoiceId,
      promotion_id: promotionId,
      discount_applied: discountApplied
    });

    await invoicePromotion.save();
    return invoicePromotion;
  }

  async getStatistics() {
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ payment_status: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ payment_status: 'pending' });
    const cancelledInvoices = await Invoice.countDocuments({ payment_status: 'cancelled' });

    const totalRevenue = await Invoice.aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    const totalDiscount = await Invoice.aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$discount_amount' } } }
    ]);

    return {
      total: totalInvoices,
      paid: paidInvoices,
      pending: pendingInvoices,
      cancelled: cancelledInvoices,
      total_revenue: totalRevenue[0]?.total || 0,
      total_discount: totalDiscount[0]?.total || 0
    };
  }

  async getRevenueByDateRange(startDate, endDate) {
    const revenue = await Invoice.aggregate([
      {
        $match: {
          payment_status: 'paid',
          invoice_date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$invoice_date' } },
          total_amount: { $sum: '$total_amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return revenue;
  }
}

module.exports = InvoiceRepository;
