const { User, StaffWaiter, StaffCashier, StaffManager } = require('../../models');
const StaffEntity = require('../../domain_layer/staff/staff.entity');

class StaffRepository {
  getModelByRole(role) {
    switch(role) {
      case 'cashier': return StaffCashier;
      case 'manager': return StaffManager;
      default: return StaffWaiter;
    }
  }
  async findAll(filters = {}) {
    const query = { role: { $in: ['waiter', 'cashier', 'manager'] } };
    
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    if (filters.search) {
      query.$or = [
        { full_name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const staffList = await User.find(query).select('-password_hash');
    return staffList.map(staff => new StaffEntity(staff.toObject()));
  }

  async findById(id) {
    const staff = await User.findById(id).select('-password_hash');
    if (!staff || !['waiter', 'cashier', 'manager'].includes(staff.role)) return null;
    return new StaffEntity(staff.toObject());
  }

  async findByEmail(email) {
    const staff = await User.findOne({ email, role: { $in: ['waiter', 'cashier', 'manager'] } });
    if (!staff) return null;
    return staff;
  }

  async findByUsername(username) {
    const staff = await User.findOne({ username, role: { $in: ['waiter', 'cashier', 'manager'] } });
    if (!staff) return null;
    return staff;
  }

  async create(staffData) {
    if (!staffData.role) {
      staffData.role = 'waiter';
    }
    const Model = this.getModelByRole(staffData.role);
    const staff = new Model(staffData);
    const savedStaff = await staff.save();
    return new StaffEntity(savedStaff.toObject());
  }

  async update(id, updateData) {
    updateData.updated_at = new Date();
    const staff = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!staff || !['waiter', 'cashier', 'manager'].includes(staff.role)) return null;
    return new StaffEntity(staff.toObject());
  }

  async delete(id) {
    const staff = await User.findByIdAndDelete(id);
    return staff !== null;
  }

  async deactivate(id) {
    const staff = await User.findByIdAndUpdate(
      id,
      { is_active: false, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!staff || !['waiter', 'cashier', 'manager'].includes(staff.role)) return null;
    return new StaffEntity(staff.toObject());
  }

  async activate(id) {
    const staff = await User.findByIdAndUpdate(
      id,
      { is_active: true, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!staff || !['waiter', 'cashier', 'manager'].includes(staff.role)) return null;
    return new StaffEntity(staff.toObject());
  }

  async countByRole(role) {
    return await Staff.countDocuments({ role, is_active: true });
  }

  async getStatistics() {
    const total = await User.countDocuments({ role: { $in: ['waiter', 'cashier', 'manager'] } });
    const active = await User.countDocuments({ role: { $in: ['waiter', 'cashier', 'manager'] }, is_active: true });
    const inactive = await User.countDocuments({ role: { $in: ['waiter', 'cashier', 'manager'] }, is_active: false });
    
    const byRole = await User.aggregate([
      { $match: { role: { $in: ['waiter', 'cashier', 'manager'] } } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total,
      active,
      inactive,
      byRole: byRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  }
}

module.exports = StaffRepository;
