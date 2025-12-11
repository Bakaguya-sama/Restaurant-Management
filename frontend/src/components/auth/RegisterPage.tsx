import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, Lock, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0056D2]/10 to-white p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="mb-2 text-green-600">Đăng ký thành công!</h2>
          <p className="text-gray-600 mb-4">
            Tài khoản của bạn đã được tạo. Đang chuyển đến trang đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1676300183339-09e3824b215d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGlzaGVzJTIwZ291cm1ldHxlbnwxfHx8fDE3NjUzODM4NTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/80 to-transparent flex items-center justify-center">
          <div className="text-white px-12">
            <h1 className="text-white mb-4">Trở thành thành viên</h1>
            <h3 className="text-white mb-6">Nhận nhiều ưu đãi hấp dẫn</h3>
            <ul className="space-y-3 text-white/90">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Tích điểm mỗi lần đặt bàn
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Nhận voucher giảm giá độc quyền
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Ưu tiên đặt bàn trong giờ cao điểm
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="mb-2">Đăng ký tài khoản</h2>
            <p className="text-gray-600">
              Tạo tài khoản để nhận ưu đãi hấp dẫn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Họ và tên"
              type="text"
              placeholder="Nhập họ và tên đầy đủ"
              icon={<User className="w-4 h-4" />}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />

            <Input
              label="Số điện thoại"
              type="tel"
              placeholder="Nhập số điện thoại"
              icon={<Phone className="w-4 h-4" />}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Nhập địa chỉ email"
              icon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              icon={<Lock className="w-4 h-4" />}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              icon={<Lock className="w-4 h-4" />}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-gray-300"
                  required
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="#" className="text-[#0056D2] hover:underline">
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a href="#" className="text-[#0056D2] hover:underline">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>
            </div>

            <Button type="submit" fullWidth size="lg">
              Đăng ký thành viên
            </Button>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#0056D2] hover:underline"
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
