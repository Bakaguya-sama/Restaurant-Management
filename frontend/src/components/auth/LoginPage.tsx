import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, User, AlertCircle } from "lucide-react";
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
  const [staffForm, setStaffForm] = useState({ 
    employeeId: "", 
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(customerForm.identifier, customerForm.password, "customer");
      navigate("/customer/home");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userProfile = await login(staffForm.employeeId, staffForm.password);
      
      let redirectPath: string;
      if (userProfile.role === "manager") {
        redirectPath = "/staff/manager/dashboard";
      } else if (userProfile.role === "cashier") {
        redirectPath = "/staff/cashier/invoices";
      } else {
        redirectPath = "/staff/waiter/tables";
      }
      
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
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
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <Input
                label="Số điện thoại hoặc Email"
                type="text"
                placeholder="Nhập số điện thoại hoặc email"
                icon={<Phone className="w-4 h-4" />}
                value={customerForm.identifier}
                onChange={(e) => {
                  setError("");
                  setCustomerForm({
                    ...customerForm,
                    identifier: e.target.value,
                  });
                }}
                required
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                icon={<Lock className="w-4 h-4" />}
                value={customerForm.password}
                onChange={(e) => {
                  setError("");
                  setCustomerForm({ ...customerForm, password: e.target.value });
                }}
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

              <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
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

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">📝 Tài khoản mẫu (Customer):</h4>
                <div className="space-y-2 text-xs text-blue-800">
                  <div><span className="font-semibold">🔷 Diamond:</span> <code className="bg-blue-100 px-2 py-1 rounded">tuan.nguyen@gmail.com</code></div>
                  <div><span className="font-semibold">🔶 Platinum:</span> <code className="bg-blue-100 px-2 py-1 rounded">huong.tran@gmail.com</code></div>
                  <div><span className="font-semibold">🟡 Gold:</span> <code className="bg-blue-100 px-2 py-1 rounded">huy.le@gmail.com</code></div>
                  <div><span className="font-semibold">⚪ Silver:</span> <code className="bg-blue-100 px-2 py-1 rounded">nga.pham@gmail.com</code></div>
                  <div><span className="font-semibold">🟤 Bronze:</span> <code className="bg-blue-100 px-2 py-1 rounded">khoa.vo@gmail.com</code></div>
                  <div><span className="font-semibold">⚫ Regular:</span> <code className="bg-blue-100 px-2 py-1 rounded">son.hoang@gmail.com</code></div>
                  <div className="pt-2 border-t border-blue-300 text-center text-blue-700">Tất cả: <strong>password123</strong></div>
                </div>
              </div>
            </form>
          )}

          {/* Staff Login Form */}
          {activeTab === "staff" && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <Input
                label="Tên đăng nhập"
                type="text"
                placeholder="Nhập tên đăng nhập"
                icon={<User className="w-4 h-4" />}
                value={staffForm.employeeId}
                onChange={(e) => {
                  setError("");
                  setStaffForm({ ...staffForm, employeeId: e.target.value });
                }}
                required
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                icon={<Lock className="w-4 h-4" />}
                value={staffForm.password}
                onChange={(e) => {
                  setError("");
                  setStaffForm({ ...staffForm, password: e.target.value });
                }}
                required
              />

              <div className="flex items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
              </div>

              <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Tài khoản nhân viên được cấp bởi quản lý
                </p>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-900 mb-3">📝 Tài khoản mẫu (Staff):</h4>
                <div className="space-y-2 text-xs text-purple-800">
                  <div><span className="font-semibold">👨‍💼 Manager:</span> <code className="bg-purple-100 px-2 py-1 rounded">minh.manager</code> hoặc <code className="bg-purple-100 px-2 py-1 rounded">hoa.manager</code></div>
                  <div><span className="font-semibold">💰 Cashier:</span> <code className="bg-purple-100 px-2 py-1 rounded">nam.cashier</code> hoặc <code className="bg-purple-100 px-2 py-1 rounded">lan.cashier</code></div>
                  <div><span className="font-semibold">🍽️ Waiter:</span> <code className="bg-purple-100 px-2 py-1 rounded">hung.waiter</code> hoặc <code className="bg-purple-100 px-2 py-1 rounded">mai.waiter</code></div>
                  <div className="pt-2 border-t border-purple-300 text-center text-purple-700">Tất cả: <strong>password123</strong></div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
