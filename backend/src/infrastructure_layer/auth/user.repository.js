const { User, Customer } = require('../../models');
const bcrypt = require('bcryptjs');

class UserRepository {
  async findByEmailOrUsername(email, username) {
    return User.findOne({
      $or: [
        { email: { $exists: true, $eq: email } },
        { username }
      ]
    });
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findByUsername(username) {
    return User.findOne({ username });
  }

  async findByPhone(phone) {
    return User.findOne({ phone });
  }

  async findById(id) {
    return User.findById(id).select('-password_hash');
  }

  async findByIdWithPassword(id) {
    return User.findById(id);
  }

  async createCustomer(data) {
    const { full_name, email, phone, address, date_of_birth, username, password } = data;
    
    if (!email) {
      throw new Error('Email is required to create an account');
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const customerData = {
      full_name,
      email: email.toLowerCase().trim(),
      phone,
      username,
      password_hash: passwordHash,
      role: 'customer',
      membership_level: 'regular',
      points: 0,
      total_spent: 0,
      isBanned: false,
      is_active: true
    };
    
    if (address) customerData.address = address;
    if (date_of_birth) customerData.date_of_birth = date_of_birth;
    
    const customer = new Customer(customerData);

    await customer.save();
    return customer;
  }

  async updatePassword(userId, hashedPassword) {
    return User.findByIdAndUpdate(
      userId,
      { password_hash: hashedPassword },
      { new: true }
    );
  }
}

module.exports = UserRepository;
