const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.apiKeyInitialized = false;
    this.isTestMode = process.env.NODE_ENV === 'test';
    this.setupSendGrid();
  }

  get hasEmailConfig() {
    return !!(process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM);
  }

  setupSendGrid() {
    if (!this.hasEmailConfig) {
      if (!this.isTestMode) {
        console.warn('[EmailService] SendGrid is not configured. Emails will not be sent.');
      }
      return;
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.apiKeyInitialized = true;
  }

  async sendEmail(to, subject, htmlContent) {
    // Test mode: never send emails
    if (this.isTestMode) {
      return { 
        success: true, 
        message: 'Test mode: Email not sent',
        to,
        subject
      };
    }

    // Production mode: require SendGrid configuration
    if (!this.hasEmailConfig) {
      throw new Error('Email configuration is missing. Please set SENDGRID_API_KEY and EMAIL_FROM environment variables.');
    }

    if (!this.apiKeyInitialized) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.apiKeyInitialized = true;
    }

    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html: htmlContent
    };

    try {
      const result = await sgMail.send(msg);
      return result;
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${to}:`);
      console.error(`[EmailService] Error: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  
  //email verification
  

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    // Test mode: log the token for testing purposes
    if (this.isTestMode) {
      //console.log(`[EmailService TEST] Verification token for ${email}: ${token}`);
    }
    
    const htmlContent = `
      <h2>Xác thực Email</h2>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác thực email của bạn bằng cách nhấp vào liên kết dưới đây:</p>
      <a href="${verificationUrl}" style="background-color: #625EE8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Xác thực Email
      </a>
      <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
      <p>${verificationUrl}</p>
      <p>Liên kết này sẽ hết hạn trong 24 giờ.</p>
    `;

    return await this.sendEmail(email, 'Xác thực email của bạn', htmlContent);
  }

  //password reset

  async sendPasswordResetLink(toEmail, resetLink, userName) {
    const htmlContent = this.getPasswordResetLinkEmailTemplate(resetLink, userName);
    return await this.sendEmail(toEmail, 'Đặt lại mật khẩu - Nhà hàng', htmlContent);
  }

  async sendPasswordResetCode(toEmail, code, userName) {
    const htmlContent = this.getPasswordResetEmailTemplate(code, userName);
    return await this.sendEmail(toEmail, 'Mã xác nhận đặt lại mật khẩu - Nhà hàng', htmlContent);
  }

  getPasswordResetEmailTemplate(code, userName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Đặt lại mật khẩu</h2>
        <p>Xin chào ${userName},</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Mã xác nhận của bạn là:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="letter-spacing: 10px; color: #007bff; font-family: monospace;">${code}</h1>
        </div>
        <p>Nhập mã này vào ứng dụng để đặt lại mật khẩu của bạn.</p>
        <p style="color: #ff6b6b;"><strong>Mã này sẽ hết hạn trong 15 phút.</strong></p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© Nhà hàng Management System</p>
      </div>
    `;
  }

  getPasswordResetLinkEmailTemplate(resetLink, userName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Đặt lại mật khẩu</h2>
        <p>Xin chào ${userName},</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu</a>
        </div>
        <p>Hoặc sao chép và dán liên kết này vào trình duyệt:</p>
        <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${resetLink}</p>
        <p style="color: #ff6b6b;"><strong>Liên kết này sẽ hết hạn trong 1 giờ.</strong></p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© Nhà hàng Management System</p>
      </div>
    `;
  }
}

module.exports = EmailService;
