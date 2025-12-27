const AuthService = require('../../../application_layer/auth/auth.service');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async register(req, res) {
    try {
      const { full_name, email, phone, address, date_of_birth, username, password } = req.body;

      if (!full_name || !email || !phone || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields: full_name, email, phone, username, password'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      const result = await this.authService.registerCustomer({
        full_name,
        email,
        phone,
        address,
        date_of_birth,
        username,
        password
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { identifier, password, role } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tài khoản và mật khẩu'
        });
      }

      const result = await this.authService.login(identifier, password, role);

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result
      });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/username or password'
        });
      }

      if (error.message === 'Account is inactive' || error.message === 'Account is banned') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const result = await this.authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await this.authService.getCurrentUser(req.user._id);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async logout(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide current password and new password'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      const result = await this.authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
