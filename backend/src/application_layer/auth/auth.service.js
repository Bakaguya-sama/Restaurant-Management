const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const RegisterUseCase = require('./register.usecase');
const UserRepository = require('../../infrastructure_layer/auth/user.repository');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.registerUseCase = new RegisterUseCase();
    this.userRepository = new UserRepository();
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
    return this.registerUseCase.execute(data);
  }

  async login(identifier, password, role = null) {
    let user;

    if (role === 'customer') {
      user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }, { phone: identifier }],
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
    const user = await this.userRepository.findByIdWithPassword(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }
}

module.exports = AuthService;
