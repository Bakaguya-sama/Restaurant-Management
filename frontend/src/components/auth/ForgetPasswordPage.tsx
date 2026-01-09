import React, { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../lib/validation";
import { toast } from "sonner";
import { usePasswordReset } from "../../hooks/usePasswordReset";

export function ForgetPasswordPage() {
  const navigate = useNavigate();
  const { loading, error, success, email: sentEmail, forgotPassword, clearState } = usePasswordReset();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(email);
    setEmailError(emailValidation.error || "");

    if (!emailValidation.isValid) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }

    await forgotPassword({ email });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#625EE8]/10 to-white p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="mb-2 text-green-600">Email đã được gửi!</h2>
          <p className="text-gray-600 mb-4">
            Vui lòng kiểm tra email của bạn ({sentEmail}) để lấy liên kết đặt lại mật khẩu. Liên kết này sẽ hết hạn trong 1 giờ.
          </p>
          <Button 
            onClick={() => {
              clearState();
              navigate("/login");
            }}
            fullWidth
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/res2-img.avif"
          alt="Food"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="mb-2">Quên mật khẩu</h2>
            <p className="text-gray-600">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="Nhập địa chỉ email"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                required
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
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
        </div>
      </div>
    </div>
  );
}
