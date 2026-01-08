const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    console.log("[EmailService] Initializing with:", {
      service: process.env.EMAIL_SERVICE || "gmail",
      user: process.env.EMAIL_USER ? "SET" : "MISSING",
      pass: process.env.EMAIL_PASSWORD ? "SET" : "MISSING",
    });

    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Prevent hanging on connection issues
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 15000, // 15 seconds
    });
  }

  async sendPasswordResetCode(toEmail, code, userName) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Mã xác nhận đặt lại mật khẩu - Nhà hàng",
      html: this.getPasswordResetEmailTemplate(code, userName),
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetLink(toEmail, resetLink, userName) {
    console.log(`[EmailService] Sending password reset email to: ${toEmail}`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Đặt lại mật khẩu - Nhà hàng",
      html: this.getPasswordResetLinkEmailTemplate(resetLink, userName),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully:`, info.messageId);
      return info;
    } catch (error) {
      console.error(`[EmailService] Failed to send email:`, error.message);
      throw new Error(`Không thể gửi email: ${error.message}`);
    }
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
