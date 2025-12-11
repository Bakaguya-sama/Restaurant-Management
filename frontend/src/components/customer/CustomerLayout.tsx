import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  UtensilsCrossed,
  Calendar,
  Gift,
  FileText,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function CustomerLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { id: "home", label: "Trang chủ", icon: Home, path: "/customer/home" },
    {
      id: "menu",
      label: "Thực đơn",
      icon: UtensilsCrossed,
      path: "/customer/menu",
    },
    {
      id: "booking",
      label: "Đặt bàn",
      icon: Calendar,
      path: "/customer/booking",
    },
    {
      id: "membership",
      label: "Ưu đãi & Thành viên",
      icon: Gift,
      path: "/customer/membership",
    },
    {
      id: "bills",
      label: "Hóa đơn của tôi",
      icon: FileText,
      path: "/customer/bills",
    },
    {
      id: "profile",
      label: "Hồ sơ cá nhân",
      icon: User,
      path: "/customer/profile",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#0056D2] rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-[#0056D2]">Restaurant</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#0056D2] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex overflow-x-auto px-2 py-2 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-xs ${
                      isActive
                        ? "bg-[#0056D2] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
