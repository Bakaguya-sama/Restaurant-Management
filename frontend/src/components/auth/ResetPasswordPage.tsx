import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { toast } from "sonner";
import { validatePassword } from "../../lib/validation";
import { authService } from "../../lib/authService";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Liên kết không hợp lệ");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidation = validatePassword(form.newPassword);
    const newErrors = {
      newPassword: passwordValidation.error || "",
      confirmPassword: "",
    };

    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);

    if (!passwordValidation.isValid || newErrors.confirmPassword) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        token: token!,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      toast.success("Đặt lại mật khẩu thành công!");
      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#625EE8]/10 to-white p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="mb-2 text-green-600">Đặt lại mật khẩu thành công!</h2>
          <p className="text-gray-600 mb-4">
            Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng đến trang đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
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
            <h2 className="mb-2">Đặt lại mật khẩu</h2>
            <p className="text-gray-600">
              Nhập mật khẩu mới của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Input
                  label="Mật khẩu mới"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  icon={<Lock className="w-4 h-4" />}
                  value={form.newPassword}
                  onChange={(e) => {
                    setForm({ ...form, newPassword: e.target.value });
                    if (errors.newPassword) setErrors({ ...errors, newPassword: "" });
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  icon={<Lock className="w-4 h-4" />}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Quay lại{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#625EE8] hover:underline"
                >
                  đăng nhập
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
