const { EmailVerification } = require('../../models');

class EmailVerificationRepository {
  async create(data) {
    const verification = new EmailVerification({
      email: data.email,
      token: data.token,
      expires_at: data.expires_at,
      is_verified: false
    });
    return await verification.save();
  }

  async findByToken(token) {
    return await EmailVerification.findOne({ token });
  }

  async findByEmail(email) {
    return await EmailVerification.findOne({ email });
  }

  async updateVerification(token) {
    return await EmailVerification.findOneAndUpdate(
      { token },
      { is_verified: true, verified_at: new Date() },
      { new: true }
    );
  }

  async deleteByToken(token) {
    return await EmailVerification.deleteOne({ token });
  }

  async deleteByEmail(email) {
    return await EmailVerification.deleteMany({ email });
  }

  async deleteExpiredTokens() {
    return await EmailVerification.deleteMany({ expires_at: { $lt: new Date() } });
  }
}

module.exports = EmailVerificationRepository;
