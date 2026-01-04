const crypto = require('crypto');

class PasswordResetToken {
  constructor(schema) {
    this.schema = schema;
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async generateResetRecord(userId) {
    const token = this.generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const resetRecord = new this.schema({
      userId,
      token,
      expiresAt,
      attempts: 0
    });

    await resetRecord.save();
    return token;
  }

  async findByToken(token) {
    return this.schema.findOne({
      token,
      expiresAt: { $gt: Date.now() }
    });
  }

  async incrementAttempts(recordId) {
    return this.schema.findByIdAndUpdate(
      recordId,
      { $inc: { attempts: 1 } },
      { new: true }
    );
  }

  async deleteRecord(recordId) {
    return this.schema.findByIdAndDelete(recordId);
  }

  async deleteByUserId(userId) {
    return this.schema.deleteMany({ userId });
  }
}

module.exports = PasswordResetToken;
