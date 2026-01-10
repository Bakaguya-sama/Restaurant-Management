const crypto = require('crypto');
const EmailService = require('../../infrastructure_layer/email/email.service');
const EmailVerificationRepository = require('../../infrastructure_layer/auth/emailverification.repository');
const EmailVerificationEntity = require('../../domain_layer/auth/emailverification.entity');

class EmailVerificationService {
  constructor() {
    this.emailService = new EmailService();
    this.emailVerificationRepository = new EmailVerificationRepository();
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  getExpirationTime() {
    const expiresIn = 24;
    const now = new Date();
    return new Date(now.getTime() + expiresIn * 60 * 60 * 1000);
  }

  async checkCooldown(email) {
    const existingVerification = await this.emailVerificationRepository.findByEmail(email);
    
    if (existingVerification && existingVerification.last_sent_at) {
      const lastSentTime = new Date(existingVerification.last_sent_at).getTime();
      const currentTime = new Date().getTime();
      const timeDiffInSeconds = (currentTime - lastSentTime) / 1000;
      const cooldownSeconds = 60;

      if (timeDiffInSeconds < cooldownSeconds) {
        const remainingSeconds = Math.ceil(cooldownSeconds - timeDiffInSeconds);
        throw new Error(`Vui lòng chờ ${remainingSeconds} giây trước khi yêu cầu gửi lại email xác thực`);
      }
    }
  }

  async createVerificationToken(email) {
    await this.emailVerificationRepository.deleteByEmail(email);

    const token = this.generateToken();
    const expiresAt = this.getExpirationTime();
    const now = new Date();

    const verificationEntity = new EmailVerificationEntity({
      email,
      token,
      expires_at: expiresAt,
      is_verified: false
    });

    const validation = verificationEntity.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const createdVerification = await this.emailVerificationRepository.create({
        email,
        token,
        expires_at: expiresAt,
        last_sent_at: now
      });
      
      if (createdVerification.token !== token) {
        throw new Error('Token mismatch - verification token not properly saved');
      }
      
      return createdVerification;
    } catch (error) {
      if (error.code === 11000) {
        console.warn(`Duplicate key error for email ${email}. Attempting cleanup and retry.`);
        await this.emailVerificationRepository.deleteByEmail(email);
        const createdVerification = await this.emailVerificationRepository.create({
          email,
          token,
          expires_at: expiresAt,
          last_sent_at: now
        });
        
        if (createdVerification.token !== token) {
          throw new Error('Token mismatch on retry - verification token not properly saved');
        }
        
        return createdVerification;
      }
      throw error;
    }
  }

  async sendVerificationEmail(email, token) {
    return await this.emailService.sendVerificationEmail(email, token);
  }

  async verifyEmail(token) {
    const { User } = require('../../models');
    
    const verification = await this.emailVerificationRepository.findByToken(token);
    
    if (!verification) {
      throw new Error('Verification token not found or expired');
    }

    const verificationEntity = new EmailVerificationEntity(verification.toObject());
    
    if (!verificationEntity.canVerify()) {
      if (verificationEntity.isExpired()) {
        throw new Error('Verification token has expired');
      }
      throw new Error('Email already verified');
    }

    
    const userUpdate = await User.updateOne(
      { email: verification.email },
      { is_email_verified: true, updated_at: new Date() }
    );

    if (!userUpdate.acknowledged || userUpdate.matchedCount === 0) {
      throw new Error('Failed to update user email verification status');
    }

    await this.emailVerificationRepository.deleteByToken(token);
    
    return { success: true, message: 'Email verified and token deleted' };
  }

  async isEmailVerified(email) {
    const verification = await this.emailVerificationRepository.findByEmail(email);
    return verification && verification.is_verified;
  }

  async cleanupExpiredTokens() {
    return await this.emailVerificationRepository.deleteExpiredTokens();
  }
}

module.exports = EmailVerificationService;
