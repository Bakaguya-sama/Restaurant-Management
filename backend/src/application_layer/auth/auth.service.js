const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Customer, Staff } = require('../../models');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        type: user.role === 'customer' ? 'customer' : 'staff'
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id,
        type: user.role === 'customer' ? 'customer' : 'staff'
      },
      this.jwtRefreshSecret,
      { expiresIn: '7d' }
    );
  }

  async registerCustomer(data) {
    const { full_name, email, phone, address, date_of_birth, username, password } = data;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
    }

    const password_hash = await bcrypt.hash(password, 10);

    const customer = new Customer({
      full_name,
      email,
      phone,
      address,
      date_of_birth,
      username,
      password_hash,
      role: 'customer',
      membership_level: 'regular',
      points: 0,
      total_spent: 0,
      isBanned: false,
      is_active: true
    });

    await customer.save();

    const accessToken = this.generateAccessToken(customer);
    const refreshToken = this.generateRefreshToken(customer);

    return {
      accessToken,
      refreshToken,
      user: {
        id: customer._id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: customer.role,
        membership_level: customer.membership_level,
        points: customer.points,
        total_spent: customer.total_spent
      }
    };
  }

  async login(identifier, password, role = null) {
    let user;

    if (role === 'customer') {
      user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
        role: 'customer'
      });
    } else if (role && ['waiter', 'cashier', 'manager'].includes(role)) {
      user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
        role: role
      });
    } else {
      user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
      });
    }

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không đúng');
    }

    if (!user.is_active) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    if (user.role === 'customer' && user.isBanned) {
      throw new Error('Tài khoản đã bị khóa');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Tài khoản hoặc mật khẩu không đúng');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const userData = {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      username: user.username
    };

    if (user.role === 'customer') {
      userData.membership_level = user.membership_level;
      userData.points = user.points;
      userData.total_spent = user.total_spent;
      userData.isBanned = user.isBanned;
    } else {
      userData.hire_date = user.hire_date;
    }

    return {
      accessToken,
      refreshToken,
      user: userData
    };
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret);
      
      const user = await User.findById(decoded.id);
      
      if (!user || !user.is_active) {
        throw new Error('Invalid refresh token');
      }

      if (user.role === 'customer' && user.isBanned) {
        throw new Error('Account is banned');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-password_hash');
    
    if (!user) {
      throw new Error('User not found');
    }

    const userData = {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      username: user.username,
      image_url: user.image_url
    };

    if (user.role === 'customer') {
      userData.membership_level = user.membership_level;
      userData.points = user.points;
      userData.total_spent = user.total_spent;
      userData.isBanned = user.isBanned;
    } else {
      userData.hire_date = user.hire_date;
    }

    return userData;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

module.exports = AuthService;
