const { Customer } = require('../../models');
const CustomerEntity = require('../../domain_layer/customer/customer.entity');

class CustomerRepository {
  async findAll(filters = {}) {
    const query = {};
    
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

    const customers = await Customer.find(query).select('-password_hash');
    return customers.map(customer => new CustomerEntity(customer.toObject()));
  }

  async findById(id) {
    const customer = await Customer.findById(id).select('-password_hash');
    if (!customer) return null;
    return new CustomerEntity(customer.toObject());
  }

  async findByEmail(email) {
    const customer = await Customer.findOne({ email });
    if (!customer) return null;
    return customer;
  }

  async create(customerData) {
    const customer = new Customer(customerData);
    const savedCustomer = await customer.save();
    return new CustomerEntity(savedCustomer.toObject());
  }

  async update(id, updateData) {
    updateData.updated_at = new Date();
    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!customer) return null;
    return new CustomerEntity(customer.toObject());
  }

  async delete(id) {
    const customer = await Customer.findByIdAndDelete(id);
    return customer !== null;
  }

  async ban(id) {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { isBanned: true, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!customer) return null;
    return new CustomerEntity(customer.toObject());
  }

  async unban(id) {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { isBanned: false, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!customer) return null;
    return new CustomerEntity(customer.toObject());
  }

  async updatePoints(id, points) {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { $inc: { points: points }, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!customer) return null;
    return new CustomerEntity(customer.toObject());
  }

  async updateTotalSpent(id, amount) {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { $inc: { total_spent: amount }, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!customer) return null;
    return new CustomerEntity(customer.toObject());
  }

  async upgradeMembership(id, newLevel) {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { membership_level: newLevel, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!customer) return null;
    return new CustomerEntity(customer.toObject());
  }

  async getStatistics() {
    const total = await Customer.countDocuments();
    const banned = await Customer.countDocuments({ isBanned: true });
    const active = total - banned;

    const byMembershipLevel = await Customer.aggregate([
      {
        $group: {
          _id: '$membership_level',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSpending = await Customer.aggregate([
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
    const customers = await Customer.find()
      .sort({ total_spent: -1 })
      .limit(limit)
      .select('-password_hash');
    
    return customers.map(customer => new CustomerEntity(customer.toObject()));
  }
}

module.exports = CustomerRepository;
