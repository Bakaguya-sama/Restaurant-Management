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
    if (updateData.role) {
      return await this.updateRole(id, updateData.role, updateData);
    }
    
    updateData.updated_at = new Date();
    const staff = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!staff || !['waiter', 'cashier', 'manager'].includes(staff.role)) return null;
    return new StaffEntity(staff.toObject());
  }

  async updateRole(id, newRole, additionalData = {}) {
    if (!['waiter', 'cashier', 'manager'].includes(newRole)) {
      throw new Error('Invalid role. Must be waiter, cashier, or manager');
    }

    const existingStaff = await User.findById(id);
    if (!existingStaff || !['waiter', 'cashier', 'manager'].includes(existingStaff.role)) {
      throw new Error('Staff not found');
    }

    if (existingStaff.role === newRole) {
      if (Object.keys(additionalData).length > 0) {
        delete additionalData.role;
        additionalData.updated_at = new Date();
        const updated = await User.findByIdAndUpdate(
          id,
          additionalData,
          { new: true, runValidators: true }
        ).select('-password_hash');
        return new StaffEntity(updated.toObject());
      }
      return new StaffEntity(existingStaff.toObject());
    }

    const staffData = existingStaff.toObject();
    delete staffData._id;
    delete staffData.__v;
    delete staffData.__t;
    
    staffData.role = newRole;
    staffData.updated_at = new Date();
    
    Object.keys(additionalData).forEach(key => {
      if (key !== 'role' && additionalData[key] !== undefined) {
        staffData[key] = additionalData[key];
      }
    });

    await User.findByIdAndDelete(id);

    const NewModel = this.getModelByRole(newRole);
    const newStaff = new NewModel({
      _id: existingStaff._id,
      ...staffData
    });
    
    const savedStaff = await newStaff.save();
    return new StaffEntity(savedStaff.toObject());
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
