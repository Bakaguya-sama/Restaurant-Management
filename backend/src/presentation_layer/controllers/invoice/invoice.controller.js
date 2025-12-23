const InvoiceService = require('../../../application_layer/invoice/invoice.service');

class InvoiceController {
  constructor() {
    this.invoiceService = new InvoiceService();
  }

  async getAllInvoices(req, res) {
    try {
      const filters = {
        payment_status: req.query.payment_status,
        payment_method: req.query.payment_method,
        customer_id: req.query.customer_id,
        staff_id: req.query.staff_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        search: req.query.search
      };

      const invoices = await this.invoiceService.getAllInvoices(filters);
      
      res.status(200).json({
        success: true,
        count: invoices.length,
        data: invoices
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getInvoiceById(req, res) {
    try {
      const invoice = await this.invoiceService.getInvoiceById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getInvoiceByInvoiceNumber(req, res) {
    try {
      const invoice = await this.invoiceService.getInvoiceByInvoiceNumber(req.params.invoiceNumber);
      
      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getInvoiceByOrderId(req, res) {
    try {
      const invoice = await this.invoiceService.getInvoiceByOrderId(req.params.orderId);
      
      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createInvoice(req, res) {
    try {
      const invoice = await this.invoiceService.createInvoice(req.body);
      
      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateInvoice(req, res) {
    try {
      const invoice = await this.invoiceService.updateInvoice(req.params.id, req.body);
      
      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteInvoice(req, res) {
    try {
      const result = await this.invoiceService.deleteInvoice(req.params.id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('Cannot delete') ? 400 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async markAsPaid(req, res) {
    try {
      const { payment_method, promotion_id } = req.body;
      const invoice = await this.invoiceService.markAsPaid(req.params.id, payment_method, promotion_id);
      
      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancelInvoice(req, res) {
    try {
      const invoice = await this.invoiceService.cancelInvoice(req.params.id);
      
      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getInvoiceStatistics(req, res) {
    try {
      const statistics = await this.invoiceService.getInvoiceStatistics();
      
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

  async getRevenueByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const revenue = await this.invoiceService.getRevenueByDateRange(start_date, end_date);
      
      res.status(200).json({
        success: true,
        data: revenue
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = InvoiceController;
