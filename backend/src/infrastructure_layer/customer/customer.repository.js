const { User, Customer: CustomerModel } = require('../../models');
const CustomerEntity = require('../../domain_layer/customer/customer.entity');

class CustomerRepository {
  async findAll(filters = {}) {
    const query = { role: 'customer' };
    
    if (filters.membership_level) {
      query.membership_level = filters.membership_level;
    }
    
    if (filters.isBanned !== undefined) {
      query.isBanned = filters.isBanned;
    }

    if (filters.search) {
      query.$or = [
        { full_name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query).select('-password_hash');
    return customers.map(customer => new CustomerEntity(customer.toObject()));
  }

  async findById(id) {
    const customer = await User.findById(id).select('-password_hash');
    if (!customer || customer.role !== 'customer') return null;
    return new CustomerEntity(customer.toObject());
  }

  async findByEmail(email) {
    const customer = await User.findOne({ email, role: 'customer' });
    if (!customer) return null;
    return customer;
  }

  async create(customerData) {
    customerData.role = 'customer';
    const customer = new CustomerModel(customerData);
    const savedCustomer = await customer.save();
    return new CustomerEntity(savedCustomer.toObject());
  }

  async update(id, updateData) {
    updateData.updated_at = new Date();
    const customer = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!customer || customer.role !== 'customer') return null;
    return new CustomerEntity(customer.toObject());
  }

  async delete(id) {
    const customer = await User.findByIdAndDelete(id);
    return customer !== null;
  }

  async ban(id) {
    // Use CustomerModel to ensure proper schema access
    const customer = await CustomerModel.findByIdAndUpdate(
      id,
      { isBanned: true, updated_at: new Date() },
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    return new CustomerEntity(customer.toObject());
  }

  async unban(id) {
    // Use CustomerModel to ensure proper schema access
    const customer = await CustomerModel.findByIdAndUpdate(
      id,
      { isBanned: false, updated_at: new Date() },
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    return new CustomerEntity(customer.toObject());
  }

  async updatePoints(id, points) {
    // Use CustomerModel to ensure discriminator fields are accessible
    const customer = await CustomerModel.findByIdAndUpdate(
      id,
      { 
        $inc: { points: points },
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    return new CustomerEntity(customer.toObject());
  }

  async updateTotalSpent(id, amount) {
    // Use CustomerModel to ensure discriminator fields are accessible
    const customer = await CustomerModel.findByIdAndUpdate(
      id,
      { 
        $inc: { total_spent: amount },
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!customer) {
      throw new Error('Failed to update customer spending');
    }

    return new CustomerEntity(customer.toObject());
  }

  async upgradeMembership(id, newLevel) {
    // Use CustomerModel to ensure proper schema access
    const customer = await CustomerModel.findByIdAndUpdate(
      id,
      { membership_level: newLevel, updated_at: new Date() },
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    return new CustomerEntity(customer.toObject());
  }

  async getStatistics() {
    const total = await User.countDocuments({ role: 'customer' });
    const banned = await User.countDocuments({ role: 'customer', isBanned: true });
    const active = total - banned;

    const byMembershipLevel = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: '$membership_level',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSpending = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_spent' }
        }
      }
    ]);

    return {
      total,
      active,
      banned,
      byMembershipLevel: byMembershipLevel.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalRevenue: totalSpending[0]?.total || 0
    };
  }

  async getTopCustomers(limit = 10) {
    const customers = await User.find({ role: 'customer' })
      .sort({ total_spent: -1 })
      .limit(limit)
      .select('-password_hash');
    
    return customers.map(customer => new CustomerEntity(customer.toObject()));
  }
}

module.exports = CustomerRepository;
