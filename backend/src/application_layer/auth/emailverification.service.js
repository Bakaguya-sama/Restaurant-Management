const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const EmailVerificationRepository = require('../../infrastructure_layer/auth/emailverification.repository');
const EmailVerificationEntity = require('../../domain_layer/auth/emailverification.entity');

class EmailVerificationService {
  constructor() {
    this.emailVerificationRepository = new EmailVerificationRepository();
    this.apiKeyInitialized = false;
    this.setupSendGrid();
  }

  get hasEmailConfig() {
    return !!(process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM);
  }

  setupSendGrid() {
    if (!this.hasEmailConfig) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[EmailVerificationService] SendGrid is not configured. Email verification tokens will be created but emails will not be sent.');
      }
      return;
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.apiKeyInitialized = true;
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
    if (!this.hasEmailConfig) {
      if (process.env.NODE_ENV === 'test') {
        return { success: true, message: 'SendGrid not configured. Token logged to console.' };
      }
      throw new Error('Email configuration is missing. Please set SENDGRID_API_KEY and EMAIL_FROM environment variables.');
    }

    if (!token) {
      throw new Error(`[EmailVerificationService] No token provided for email ${email}`);
    }

    if (!this.apiKeyInitialized) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.apiKeyInitialized = true;
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Xác thực email của bạn',
      html: `
        <h2>Xác thực Email</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác thực email của bạn bằng cách nhấp vào liên kết dưới đây:</p>
        <a href="${verificationUrl}" style="background-color: #625EE8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Xác thực Email
        </a>
        <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
        <p>${verificationUrl}</p>
        <p>Liên kết này sẽ hết hạn trong 24 giờ.</p>
      `
    };

    try {
      const result = await sgMail.send(msg);
      return result;
    } catch (error) {
      console.error(`[EmailVerificationService] Failed to send email to ${email}:`);
      console.error(`[EmailVerificationService] Error message: ${error.message}`);
      console.error(`[EmailVerificationService] Error code: ${error.code}`);
      console.error(`[EmailVerificationService] Full error:`, error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
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

    const updated = await this.emailVerificationRepository.updateVerification(token);
    
    return updated;
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
