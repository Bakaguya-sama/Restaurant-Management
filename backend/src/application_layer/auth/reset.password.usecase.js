const bcrypt = require('bcryptjs');
const { ResetPasswordRequest } = require('../../domain_layer/auth/password.reset.dto');
const PasswordResetToken = require('../../infrastructure_layer/password_reset/password.reset.repository');
const { User, PasswordResetToken: PasswordResetTokenModel } = require('../../models');

class ResetPasswordUseCase {
  constructor() {
    this.passwordResetToken = new PasswordResetToken(PasswordResetTokenModel);
  }

  async execute(resetPasswordRequest) {
    if (!resetPasswordRequest.isValid()) {
      throw new Error('Invalid password reset request');
    }

    const resetRecord = await this.passwordResetToken.findByToken(
      resetPasswordRequest.token
    );

    if (!resetRecord) {
      throw new Error('Invalid or expired reset link');
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordRequest.newPassword, 10);

    user.password_hash = hashedPassword;
    await user.save();

    await this.passwordResetToken.deleteRecord(resetRecord._id);

    return {
      message: 'Password reset successfully',
      email: user.email
    };
  }
}

module.exports = ResetPasswordUseCase;
