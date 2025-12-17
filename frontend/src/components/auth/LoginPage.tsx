import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, User } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { UserRole } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"customer" | "staff">("customer");
  const [customerForm, setCustomerForm] = useState({
    identifier: "",
    password: "",
  });
  const [staffForm, setStaffForm] = useState({ employeeId: "", password: "" });

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app, validate credentials
    login("customer");
    navigate("/customer/home");
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - simulate different roles based on employee ID
    let role: UserRole;
    let redirectPath: string;

    if (staffForm.employeeId.startsWith("MGR")) {
      role = "manager";
      redirectPath = "/staff/manager/dashboard";
    } else if (staffForm.employeeId.startsWith("CSH")) {
      role = "cashier";
      redirectPath = "/staff/cashier/invoices";
    } else {
      role = "waiter";
      redirectPath = "/staff/waiter/tables";
    }

    login(role);
    navigate(redirectPath);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/res-img.avif"
          alt="Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#625EE8]/80 to-transparent flex items-center justify-center">
          <div className="text-white px-12">
            {/* <h1 className="text-white mb-6">Restaurant Management System</h1> */}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="mb-2">Đăng nhập</h2>
            <p className="text-gray-600">Chọn loại tài khoản</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("customer")}
              className={`flex-1 py-2.5 rounded-md transition-all ${
                activeTab === "customer"
                  ? "bg-white shadow-sm text-[#625EE8]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Khách hàng
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex-1 py-2.5 rounded-md transition-all ${
                activeTab === "staff"
                  ? "bg-white shadow-sm text-[#625EE8]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Nhân viên
            </button>
          </div>

          {/* Customer Login Form */}
          {activeTab === "customer" && (
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <Input
                label="Số điện thoại hoặc Email"
                type="text"
                placeholder="Nhập số điện thoại hoặc email"
                icon={<Phone className="w-4 h-4" />}
                value={customerForm.identifier}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    identifier: e.target.value,
                  })
                }
                required
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                icon={<Lock className="w-4 h-4" />}
                value={customerForm.password}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, password: e.target.value })
                }
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <a
                  href="/forget-password"
                  className="text-[#625EE8] hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Button type="submit" fullWidth size="lg">
                Đăng nhập
              </Button>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-[#625EE8] hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Staff Login Form */}
          {activeTab === "staff" && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <Input
                label="Mã nhân viên"
                type="text"
                placeholder="Nhập mã nhân viên (VD: MGR001, CSH001, WTR001)"
                icon={<User className="w-4 h-4" />}
                value={staffForm.employeeId}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, employeeId: e.target.value })
                }
                required
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                icon={<Lock className="w-4 h-4" />}
                value={staffForm.password}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, password: e.target.value })
                }
                required
              />

              <div className="flex items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
              </div>

              <Button type="submit" fullWidth size="lg">
                Đăng nhập
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Tài khoản nhân viên được cấp bởi quản lý
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
