const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CustomerRepository = require('../../infrastructure_layer/customer/customer.repository');
const CustomerEntity = require('../../domain_layer/customer/customer.entity');

class CustomerService {
  constructor() {
    this.customerRepository = new CustomerRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  async getAllCustomers(filters) {
    return await this.customerRepository.findAll(filters);
  }

  async getCustomerById(id) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async createCustomer(customerData) {
    const existingEmail = await this.customerRepository.findByEmail(customerData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const customerEntity = new CustomerEntity(customerData);
    const validation = customerEntity.validate();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    if (customerData.password) {
      const salt = await bcrypt.genSalt(10);
      customerData.password_hash = await bcrypt.hash(customerData.password, salt);
      delete customerData.password;
    } else {
      throw new Error('Password is required');
    }

    return await this.customerRepository.create(customerData);
  }

  async updateCustomer(id, updateData) {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    if (updateData.email && updateData.email !== existingCustomer.email) {
      const emailExists = await this.customerRepository.findByEmail(updateData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }

    return await this.customerRepository.update(id, updateData);
  }

  async deleteCustomer(id) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const result = await this.customerRepository.delete(id);
    if (!result) {
      throw new Error('Failed to delete customer');
    }

    return { message: 'Customer deleted successfully' };
  }

  async banCustomer(id) {
    const customer = await this.customerRepository.ban(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async unbanCustomer(id) {
    const customer = await this.customerRepository.unban(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async loginCustomer(email, password) {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new Error('Invalid credentials');
    }

    if (customer.isBanned) {
      throw new Error('Account is banned');
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { 
        id: customer._id,
        email: customer.email,
        membership_level: customer.membership_level,
        type: 'customer'
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    const customerEntity = new CustomerEntity(customer.toObject());
    
    return {
      token,
      customer: customerEntity.toJSON()
    };
  }

  async addPoints(id, points) {
    const customer = await this.customerRepository.updatePoints(id, points);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async addSpending(id, amount) {
    const customer = await this.customerRepository.updateTotalSpent(id, amount);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const customerEntity = new CustomerEntity(customer);
    const newLevel = customerEntity.canUpgradeMembership();
    
    if (newLevel) {
      return await this.customerRepository.upgradeMembership(id, newLevel);
    }

    return customer;
  }

  async getCustomerStatistics() {
    return await this.customerRepository.getStatistics();
  }

  async getTopCustomers(limit = 10) {
    return await this.customerRepository.getTopCustomers(limit);
  }
}

module.exports = CustomerService;
