import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Package,
  UserCircle,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu as MenuIcon,
  CreditCard,
  Utensils,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const roleNames = {
  manager: "Quản lý",
  cashier: "Thu ngân",
  waiter: "Phục vụ",
};

export function StaffLayout() {
  const navigate = useNavigate();
  const { logout, userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const role = userProfile?.role || "manager";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getMenuItems = () => {
    if (role === "manager") {
      return [
        {
          id: "dashboard",
          label: "Tổng quan",
          icon: LayoutDashboard,
          path: "/staff/manager/dashboard",
        },
        {
          id: "tables",
          label: "Quản lý bàn",
          icon: UtensilsCrossed,
          path: "/staff/manager/tables",
        },
        {
          id: "staff",
          label: "Nhân sự",
          icon: Users,
          path: "/staff/manager/staff",
        },
        {
          id: "inventory",
          label: "Kho",
          icon: Package,
          path: "/staff/manager/inventory",
        },
        {
          id: "menu",
          label: "Thực đơn",
          icon: UtensilsCrossed,
          path: "/staff/manager/menu",
        },
        {
          id: "customers",
          label: "Khách hàng",
          icon: UserCircle,
          path: "/staff/manager/customers",
        },
        {
          id: "profile",
          label: "Hồ sơ cá nhân",
          icon: Settings,
          path: "/staff/profile",
        },
      ];
    } else if (role === "cashier") {
      return [
        {
          id: "invoices",
          label: "Quản lý thanh toán",
          icon: CreditCard,
          path: "/staff/cashier/invoices",
        },
        {
          id: "profile",
          label: "Hồ sơ cá nhân",
          icon: Settings,
          path: "/staff/profile",
        },
      ];
    } else {
      return [
        {
          id: "tables-map",
          label: "Sơ đồ bàn",
          icon: LayoutDashboard,
          path: "/staff/waiter/tables",
        },
        {
          id: "orders",
          label: "Gọi món",
          icon: UtensilsCrossed,
          path: "/staff/waiter/orders",
        },
        {
          id: "profile",
          label: "Hồ sơ cá nhân",
          icon: Settings,
          path: "/staff/profile",
        },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Restaurant Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg text-[#625EE8]">RMS</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 transition-all ${
                    isActive
                      ? "bg-[#625EE8] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xlg font-semibold text-gray-800">
              {roleNames[role as keyof typeof roleNames]}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#625EE8] w-64"
              />
            </div> */}

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-[#625EE8] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">NV</span>
                </div>
                <span className="text-sm">Nhân viên</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
