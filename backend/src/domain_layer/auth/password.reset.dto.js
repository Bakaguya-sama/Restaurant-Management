class ForgotPasswordRequest {
  constructor(email) {
    this.email = email ? email.toLowerCase().trim() : '';
  }

  isValid() {
    return this.email && this.email.length > 0 && this.email.includes('@');
  }
}

class ResetPasswordRequest {
  constructor(token, newPassword, confirmPassword) {
    this.token = token;
    this.newPassword = newPassword;
    this.confirmPassword = confirmPassword;
  }

  isValid() {
    return (
      this.token &&
      this.newPassword &&
      this.confirmPassword &&
      this.newPassword === this.confirmPassword &&
      this.newPassword.length >= 6
    );
  }
}

module.exports = {
  ForgotPasswordRequest,
  ResetPasswordRequest
};
