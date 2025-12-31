const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../../infrastructure_layer/auth/user.repository');
const { CustomerRegisterRequest, AuthResponse } = require('../../domain_layer/auth/register.dto');

class RegisterUseCase {
  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  }

  async execute(request) {
    this.validateRequest(request);
    
    const existingUser = await this.userRepository.findByEmailOrUsername(request.email, request.username);
    if (existingUser) {
      this.throwDuplicateError(existingUser, request);
    }

    const customer = await this.userRepository.createCustomer(request);
    
    const accessToken = this.generateAccessToken(customer);
    const refreshToken = this.generateRefreshToken(customer);

    return new AuthResponse(accessToken, refreshToken, this.mapUserResponse(customer));
  }

  validateRequest(request) {
    if (!request.full_name?.trim()) {
      throw new Error('full_name is required');
    }
    if (!request.phone?.trim()) {
      throw new Error('phone is required');
    }
    if (!request.username?.trim()) {
      throw new Error('username is required');
    }
    if (!request.password || request.password.length < 6) {
      throw new Error('password must be at least 6 characters');
    }
    if (request.email && !this.isValidEmail(request.email)) {
      throw new Error('invalid email format');
    }
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  throwDuplicateError(existingUser, request) {
    if (existingUser.email === request.email && request.email) {
      throw new Error('email already exists');
    }
    if (existingUser.username === request.username) {
      throw new Error('username already exists');
    }
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        type: 'customer'
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id,
        type: 'customer'
      },
      this.jwtRefreshSecret,
      { expiresIn: '7d' }
    );
  }

  mapUserResponse(customer) {
    return {
      id: customer._id,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      role: customer.role,
      username: customer.username,
      membership_level: customer.membership_level,
      points: customer.points,
      total_spent: customer.total_spent
    };
  }
}

module.exports = RegisterUseCase;
