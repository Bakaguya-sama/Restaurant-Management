const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StaffRepository = require('../../infrastructure_layer/staff/staff.repository');
const StaffEntity = require('../../domain_layer/staff/staff.entity');

class StaffService {
  constructor() {
    this.staffRepository = new StaffRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  async getAllStaff(filters) {
    return await this.staffRepository.findAll(filters);
  }

  async getStaffById(id) {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new Error('Staff not found');
    }
    return staff;
  }

  async createStaff(staffData) {
    const existingEmail = await this.staffRepository.findByEmail(staffData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const existingUsername = await this.staffRepository.findByUsername(staffData.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    const staffEntity = new StaffEntity(staffData);
    const validation = staffEntity.validate();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    if (staffData.password) {
      const salt = await bcrypt.genSalt(10);
      staffData.password_hash = await bcrypt.hash(staffData.password, salt);
      delete staffData.password;
    } else {
      throw new Error('Password is required');
    }

    return await this.staffRepository.create(staffData);
  }

  async updateStaff(id, updateData) {
    const existingStaff = await this.staffRepository.findById(id);
    if (!existingStaff) {
      throw new Error('Staff not found');
    }

    if (updateData.email && updateData.email !== existingStaff.email) {
      const emailExists = await this.staffRepository.findByEmail(updateData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }

    return await this.staffRepository.update(id, updateData);
  }

  async deleteStaff(id) {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new Error('Staff not found');
    }

    const result = await this.staffRepository.delete(id);
    if (!result) {
      throw new Error('Failed to delete staff');
    }

    return { message: 'Staff deleted successfully' };
  }

  async deactivateStaff(id) {
    const staff = await this.staffRepository.deactivate(id);
    if (!staff) {
      throw new Error('Staff not found');
    }
    return staff;
  }

  async activateStaff(id) {
    const staff = await this.staffRepository.activate(id);
    if (!staff) {
      throw new Error('Staff not found');
    }
    return staff;
  }

  async loginStaff(username, password) {
    const staff = await this.staffRepository.findByUsername(username);
    if (!staff) {
      throw new Error('Invalid credentials');
    }

    if (!staff.is_active) {
      throw new Error('Account is deactivated');
    }

    const isMatch = await bcrypt.compare(password, staff.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { 
        id: staff._id,
        username: staff.username,
        role: staff.role,
        type: 'staff'
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    const staffEntity = new StaffEntity(staff.toObject());
    
    return {
      token,
      staff: staffEntity.toJSON()
    };
  }

  async getStaffStatistics() {
    return await this.staffRepository.getStatistics();
  }
}

module.exports = StaffService;
