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

  async findByPhone(phone) {
    const customer = await User.findOne({ phone, role: 'customer' });
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

    // Count VIP customers (gold, platinum, diamond)
    const vipCount = await User.countDocuments({ 
      role: 'customer', 
      membership_level: { $in: ['gold', 'platinum', 'diamond'] } 
    });

    // Count new customers (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = await User.countDocuments({ 
      role: 'customer',
      created_at: { $gte: thirtyDaysAgo }
    });

    // Count returning customers (customers with more than 1 invoice)
    const { Invoice } = require('../../models');
    const returningCustomers = await Invoice.aggregate([
      {
        $group: {
          _id: '$customer_id',
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $match: { invoiceCount: { $gt: 1 } }
      },
      {
        $count: 'total'
      }
    ]);

    // Calculate average spending per customer
    const avgSpendingResult = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: null,
          avgSpending: { $avg: '$total_spent' },
          totalRevenue: { $sum: '$total_spent' }
        }
      }
    ]);

    // Get segments by membership level with revenue
    const segments = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: '$membership_level',
          count: { $sum: 1 },
          revenue: { $sum: '$total_spent' }
        }
      },
      {
        $addFields: {
          tier: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'diamond'] }, then: 'Diamond' },
                { case: { $eq: ['$_id', 'platinum'] }, then: 'Platinum' },
                { case: { $eq: ['$_id', 'gold'] }, then: 'Gold' },
                { case: { $eq: ['$_id', 'silver'] }, then: 'Silver' },
                { case: { $eq: ['$_id', 'bronze'] }, then: 'Bronze' },
                { case: { $eq: ['$_id', 'regular'] }, then: 'Regular' }
              ],
              default: 'Regular'
            }
          }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const totalRevenue = avgSpendingResult[0]?.totalRevenue || 0;
    
    // Calculate percentage for each segment
    const segmentsWithPercentage = segments.map(seg => ({
      tier: seg.tier,
      count: seg.count,
      revenue: seg.revenue,
      percentage: totalRevenue > 0 ? (seg.revenue / totalRevenue) * 100 : 0
    }));

    return {
      total,
      active,
      banned,
      vip: vipCount,
      new: newCustomers,
      returning: returningCustomers[0]?.total || 0,
      avgSpending: avgSpendingResult[0]?.avgSpending || 0,
      totalRevenue: totalRevenue,
      segments: segmentsWithPercentage
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
