const ForgotPasswordUseCase = require('../../../application_layer/auth/forgot.password.usecase');
const ResetPasswordUseCase = require('../../../application_layer/auth/reset.password.usecase');
const { ForgotPasswordRequest, ResetPasswordRequest } = require('../../../domain_layer/auth/password.reset.dto');

class PasswordResetController {
  constructor() {
    this.forgotPasswordUseCase = new ForgotPasswordUseCase();
    this.resetPasswordUseCase = new ResetPasswordUseCase();
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const forgotPasswordRequest = new ForgotPasswordRequest(email);
      const result = await this.forgotPasswordUseCase.execute(forgotPasswordRequest);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email }
      });
    } catch (error) {
      const statusCode = error.message === 'Email not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and passwords are required'
        });
      }

      const resetPasswordRequest = new ResetPasswordRequest(
        token,
        newPassword,
        confirmPassword
      );

      const result = await this.resetPasswordUseCase.execute(resetPasswordRequest);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email }
      });
    } catch (error) {
      const statusCode =
        error.message.includes('Invalid or expired') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = PasswordResetController;
