const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const EmailVerificationRepository = require('../../infrastructure_layer/auth/emailverification.repository');
const EmailVerificationEntity = require('../../domain_layer/auth/emailverification.entity');

class EmailVerificationService {
  constructor() {
    this.emailVerificationRepository = new EmailVerificationRepository();
    this.hasEmailConfig = !!(process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM);
    this.setupSendGrid();
  }

  setupSendGrid() {
    if (!this.hasEmailConfig) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('SendGrid is not configured. Email verification tokens will be created but emails will not be sent.');
      }
      return;
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  getExpirationTime() {
    const expiresIn = 24;
    const now = new Date();
    return new Date(now.getTime() + expiresIn * 60 * 60 * 1000);
  }

  async createVerificationToken(email) {
    await this.emailVerificationRepository.deleteByEmail(email);

    const token = this.generateToken();
    const expiresAt = this.getExpirationTime();

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

    return await this.emailVerificationRepository.create({
      email,
      token,
      expires_at: expiresAt
    });
  }

  async sendVerificationEmail(email, token) {
    if (!this.hasEmailConfig) {
      console.log(`Email verification token for ${email}: ${token}`);
      return { success: true, message: 'SendGrid not configured. Token logged to console.' };
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

    return await sgMail.send(msg);
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

    const updated = await this.emailVerificationRepository.updateVerification(token);
    
    await User.updateOne(
      { email: verification.email },
      { is_email_verified: true, updated_at: new Date() }
    );

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
