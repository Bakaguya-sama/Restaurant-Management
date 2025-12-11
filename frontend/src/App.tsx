import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { CustomerLayout } from "./components/customer/CustomerLayout";
import { HomePage } from "./components/customer/HomePage";
import { BookingPage } from "./components/customer/BookingPage";
import { BookingManagementPage } from "./components/customer/BookingManagementPage";
import { MenuPage } from "./components/customer/MenuPage";
import { MembershipPage } from "./components/customer/MembershipPage";
import { BillsPage } from "./components/customer/BillsPage";
import { CustomerProfilePage } from "./components/customer/ProfilePage";
import { StaffLayout } from "./components/staff/StaffLayout";
import { ManagerDashboard } from "./components/staff/manager/DashboardPage";
import { TablesPage } from "./components/staff/manager/TablesPage";
import { HRPage } from "./components/staff/manager/HRPage";
import { InventoryPage } from "./components/staff/manager/InventoryPage";
import { CustomersPage } from "./components/staff/manager/CustomersPage";
import { MenuPromotionPage } from "./components/staff/manager/MenuPromotionPage";
import { ReportsPage } from "./components/staff/manager/ReportsPage";
import { InvoicesPage } from "./components/staff/cashier/InvoicesPage";
import { TablesMapPage } from "./components/staff/waiter/TablesMapPage";
import { OrderingPage } from "./components/staff/waiter/OrderingPage";
import { ProfilePage } from "./components/staff/ProfilePage";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route
                path="booking"
                element={<BookingPage onNavigate={() => {}} />}
              />
              <Route
                path="booking-management"
                element={<BookingManagementPage />}
              />
              <Route path="menu" element={<MenuPage />} />
              <Route path="membership" element={<MembershipPage />} />
              <Route
                path="bills"
                element={<BillsPage onNavigate={() => {}} />}
              />
              <Route path="profile" element={<CustomerProfilePage />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<StaffLayout />}>
              {/* Manager Routes */}
              <Route path="manager/dashboard" element={<ManagerDashboard />} />
              <Route path="manager/tables" element={<TablesPage />} />
              <Route path="manager/staff" element={<HRPage />} />
              <Route path="manager/inventory" element={<InventoryPage />} />
              <Route path="manager/menu" element={<MenuPromotionPage />} />
              <Route path="manager/customers" element={<CustomersPage />} />
              <Route path="manager/reports" element={<ReportsPage />} />

              {/* Cashier Routes */}
              <Route path="cashier/invoices" element={<InvoicesPage />} />

              {/* Waiter Routes */}
              <Route path="waiter/tables" element={<TablesMapPage />} />
              <Route path="waiter/orders" element={<OrderingPage />} />

              {/* Common Staff Route */}
              <Route path="profile" element={<ProfilePage role="staff" />} />
            </Route>

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
