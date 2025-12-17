import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  MessageSquareText,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useNavigate } from "react-router-dom";
import {
  validateEmail,
  validateVietnamesePhone,
  validatePassword,
  validateRequired,
} from "../../lib/validation";
import { toast } from "sonner";

export function ForgetPasswordPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    email: "",
    otp: "",
    password: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
    otp: "",
    password: "",
  });
  const [step, setStep] = useState(1); // 1: nhập email/phone, 2: nhập OTP và password
  const [isLoadingOTP, setIsLoadingOTP] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone and email
    const phoneValidation = validateVietnamesePhone(form.phone);
    const emailValidation = validateEmail(form.email);

    setErrors({
      ...errors,
      phone: phoneValidation.error || "",
      email: emailValidation.error || "",
    });

    if (!phoneValidation.isValid || !emailValidation.isValid) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsLoadingOTP(true);

    try {
      // TODO: Call API to send OTP
      // const response = await fetch('/api/auth/forgot-password/request-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     phone: form.phone,
      //     email: form.email
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to send OTP');
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setStep(2);
      setResendCountdown(60); // 60 seconds countdown
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Không thể gửi mã OTP. Vui lòng thử lại!");
    } finally {
      setIsLoadingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    setIsResendingOTP(true);

    try {
      // TODO: Call API to resend OTP
      // const response = await fetch('/api/auth/forgot-password/resend-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     phone: form.phone,
      //     email: form.email
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to resend OTP');
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Mã OTP mới đã được gửi!");
      setResendCountdown(60);
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Không thể gửi lại mã OTP. Vui lòng thử lại!");
    } finally {
      setIsResendingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate OTP and password
    const otpValidation = validateRequired(form.otp, "Mã OTP");
    const passwordValidation = validatePassword(form.password);

    setErrors({
      ...errors,
      otp: otpValidation.error || "",
      password: passwordValidation.error || "",
    });

    if (!otpValidation.isValid || !passwordValidation.isValid) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      // TODO: Call API to verify OTP and reset password
      // const response = await fetch('/api/auth/forgot-password/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     phone: form.phone,
      //     email: form.email,
      //     otp: form.otp,
      //     newPassword: form.password
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('Invalid OTP or failed to reset password');
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Đặt lại mật khẩu thành công!");
      setShowSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại!");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden ">
      {/* Right Side - Form */}
      <div className="w-full  flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="mb-2">Quên mật khẩu</h2>
            <p className="text-gray-600">
              {step === 1
                ? "Nhập thông tin để nhận mã OTP"
                : "Nhập mã OTP và mật khẩu mới"}
            </p>
          </div>

          {showSuccess ? (
            <div className="text-center py-8">
              <h3 className="mb-2 text-green-600">
                Đặt lại mật khẩu thành công!
              </h3>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <Input
                  label="Số điện thoại"
                  type="tel"
                  placeholder="Nhập số điện thoại (VD: 0912345678)"
                  icon={<Phone className="w-4 h-4" />}
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Input
                  label="Email để nhận OTP"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  icon={<Mail className="w-4 h-4" />}
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <Button type="submit" fullWidth size="lg" disabled={isLoadingOTP}>
                {isLoadingOTP ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-[#625EE8] hover:underline"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm text-blue-800">
                  Mã OTP đã được gửi đến <strong>{form.email}</strong>
                </p>
              </div>

              <div>
                <Input
                  label="Mã xác nhận (OTP)"
                  type="text"
                  placeholder="Nhập mã OTP (6 chữ số)"
                  icon={<MessageSquareText className="w-4 h-4" />}
                  value={form.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForm({ ...form, otp: value });
                    if (errors.otp) setErrors({ ...errors, otp: "" });
                  }}
                  maxLength={6}
                  required
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                )}

                {/* Resend OTP */}
                <div className="mt-2 text-sm">
                  {resendCountdown > 0 ? (
                    <p className="text-gray-600">
                      Gửi lại mã sau {resendCountdown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResendingOTP}
                      className="text-[#625EE8] hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isResendingOTP ? "Đang gửi..." : "Gửi lại mã OTP"}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <Input
                  label="Mật khẩu mới"
                  type="password"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  icon={<Lock className="w-4 h-4" />}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <Button type="submit" fullWidth size="lg">
                Đặt lại mật khẩu
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setForm({ ...form, otp: "", password: "" });
                    setErrors({ phone: "", email: "", otp: "", password: "" });
                  }}
                  className="text-gray-600 hover:underline"
                >
                  ← Quay lại
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
