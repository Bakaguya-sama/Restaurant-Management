const { Staff } = require('../../models');
const StaffEntity = require('../../domain_layer/staff/staff.entity');

class StaffRepository {
  async findAll(filters = {}) {
    const query = {};
    
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

    const staffList = await Staff.find(query).select('-password_hash');
    return staffList.map(staff => new StaffEntity(staff.toObject()));
  }

  async findById(id) {
    const staff = await Staff.findById(id).select('-password_hash');
    if (!staff) return null;
    return new StaffEntity(staff.toObject());
  }

  async findByEmail(email) {
    const staff = await Staff.findOne({ email });
    if (!staff) return null;
    return staff;
  }

  async findByUsername(username) {
    const staff = await Staff.findOne({ username });
    if (!staff) return null;
    return staff;
  }

  async create(staffData) {
    const staff = new Staff(staffData);
    const savedStaff = await staff.save();
    return new StaffEntity(savedStaff.toObject());
  }

  async update(id, updateData) {
    updateData.updated_at = new Date();
    const staff = await Staff.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!staff) return null;
    return new StaffEntity(staff.toObject());
  }

  async delete(id) {
    const staff = await Staff.findByIdAndDelete(id);
    return staff !== null;
  }

  async deactivate(id) {
    const staff = await Staff.findByIdAndUpdate(
      id,
      { is_active: false, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!staff) return null;
    return new StaffEntity(staff.toObject());
  }

  async activate(id) {
    const staff = await Staff.findByIdAndUpdate(
      id,
      { is_active: true, updated_at: new Date() },
      { new: true }
    ).select('-password_hash');
    
    if (!staff) return null;
    return new StaffEntity(staff.toObject());
  }

  async countByRole(role) {
    return await Staff.countDocuments({ role, is_active: true });
  }

  async getStatistics() {
    const total = await Staff.countDocuments();
    const active = await Staff.countDocuments({ is_active: true });
    const inactive = await Staff.countDocuments({ is_active: false });
    
    const byRole = await Staff.aggregate([
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
