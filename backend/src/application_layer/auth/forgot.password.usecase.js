const { ForgotPasswordRequest } = require('../../domain_layer/auth/password.reset.dto');
const EmailService = require('../../infrastructure_layer/password_reset/email.service');
const PasswordResetToken = require('../../infrastructure_layer/password_reset/password.reset.repository');
const { User, PasswordResetToken: PasswordResetTokenModel } = require('../../models');

class ForgotPasswordUseCase {
  constructor() {
    this.emailService = new EmailService();
    this.passwordResetToken = new PasswordResetToken(PasswordResetTokenModel);
  }

  async execute(forgotPasswordRequest) {
    if (!forgotPasswordRequest.isValid()) {
      throw new Error('Email is required');
    }

    const user = await User.findOne({ 
      email: { $regex: `^${forgotPasswordRequest.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    });
    if (!user) {
      throw new Error('Email not found');
    }

    if (!user.email) {
      throw new Error('This account does not have an email address associated with it');
    }

    await this.passwordResetToken.deleteByUserId(user._id);

    const token = await this.passwordResetToken.generateResetRecord(user._id);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetLink(
      user.email,
      resetLink,
      user.full_name
    );

    return {
      message: 'Password reset link sent successfully',
      email: user.email
    };
  }
}

module.exports = ForgotPasswordUseCase;
