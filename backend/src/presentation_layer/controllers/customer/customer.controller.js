const CustomerService = require('../../../application_layer/customer/customer.service');

class CustomerController {
  constructor() {
    this.customerService = new CustomerService();
  }

  async getAllCustomers(req, res) {
    try {
      const filters = {
        membership_level: req.query.membership_level,
        isBanned: req.query.isBanned,
        search: req.query.search
      };

      const customers = await this.customerService.getAllCustomers(filters);
      
      res.status(200).json({
        success: true,
        count: customers.length,
        data: customers.map(c => c.toJSON ? c.toJSON() : c)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCustomerById(req, res) {
    try {
      const customer = await this.customerService.getCustomerById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: customer.toJSON ? customer.toJSON() : customer
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createCustomer(req, res) {
    try {
      const customer = await this.customerService.createCustomer(req.body);
      
      res.status(201).json({
        success: true,
        data: customer.toJSON ? customer.toJSON() : customer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCustomer(req, res) {
    try {
      const customer = await this.customerService.updateCustomer(req.params.id, req.body);
      
      res.status(200).json({
        success: true,
        data: customer.toJSON ? customer.toJSON() : customer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteCustomer(req, res) {
    try {
      const result = await this.customerService.deleteCustomer(req.params.id);
      
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

  async banCustomer(req, res) {
    try {
      const customer = await this.customerService.banCustomer(req.params.id);
      
      res.status(200).json({
        success: true,
        data: customer.toJSON ? customer.toJSON() : customer
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async unbanCustomer(req, res) {
    try {
      const customer = await this.customerService.unbanCustomer(req.params.id);
      
      res.status(200).json({
        success: true,
        data: customer.toJSON ? customer.toJSON() : customer
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async loginCustomer(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await this.customerService.loginCustomer(email, password);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async addPoints(req, res) {
    try {
      const { points } = req.body;
      
      if (!points) {
        return res.status(400).json({
          success: false,
          message: 'Points value is required'
        });
      }

      const customer = await this.customerService.addPoints(req.params.id, points);
      
      res.status(200).json({
        success: true,
        data: customer.toJSON ? customer.toJSON() : customer
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async addSpending(req, res) {
    try {
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Amount value is required'
        });
      }

      const customer = await this.customerService.addSpending(req.params.id, amount);
      
      res.status(200).json({
        success: true,
        data: customer.toJSON ? customer.toJSON() : customer
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCustomerStatistics(req, res) {
    try {
      const stats = await this.customerService.getCustomerStatistics();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTopCustomers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const customers = await this.customerService.getTopCustomers(limit);
      
      res.status(200).json({
        success: true,
        count: customers.length,
        data: customers.map(c => c.toJSON ? c.toJSON() : c)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = CustomerController;
