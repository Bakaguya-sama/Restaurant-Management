const AuthService = require('../../../application_layer/auth/auth.service');
const EmailVerificationService = require('../../../application_layer/auth/emailverification.service');
const { CustomerRegisterRequest } = require('../../../domain_layer/auth/register.dto');

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.emailVerificationService = new EmailVerificationService();
  }

  async register(req, res) {
    try {
      const { full_name, email, phone, address, date_of_birth, username, password } = req.body;

      const registerRequest = new CustomerRegisterRequest(
        full_name,
        phone,
        password,
        username,
        email,
        address,
        date_of_birth
      );

      const result = await this.authService.registerCustomer(registerRequest);

      const verification = await this.emailVerificationService.createVerificationToken(email);
      await this.emailVerificationService.sendVerificationEmail(email, verification.token);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email to activate your account.',
        data: {
          ...result,
          email_verified: false
        }
      });
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required'
        });
      }

      await this.emailVerificationService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('expired') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      await this.emailVerificationService.checkCooldown(email);

      const verification = await this.emailVerificationService.createVerificationToken(email);
      await this.emailVerificationService.sendVerificationEmail(email, verification.token);

      res.status(200).json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      const isCooldownError = error.message && error.message.includes('Vui lòng chờ');
      const statusCode = isCooldownError ? 429 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message
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

  async updateEmailVerification(req, res) {
    try {
      const { is_email_verified } = req.body;
      const userId = req.user._id;

      if (typeof is_email_verified !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'is_email_verified must be a boolean'
        });
      }

      const { User } = require('../../../models');
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { is_email_verified, updated_at: new Date() },
        { new: true }
      ).select('-password_hash');

      res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
