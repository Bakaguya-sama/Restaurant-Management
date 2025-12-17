import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { ForgetPasswordPage } from "./components/auth/ForgetPasswordPage";
import { RoleBasedRoute } from "./components/auth/RoleBasedRoute";
import { UnauthorizedPage } from "./components/auth/UnauthorizedPage";
import { NotFoundPage } from "./components/auth/NotFoundPage";
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
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forget-password" element={<ForgetPasswordPage />} />

            {/* Error Pages */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/404" element={<NotFoundPage />} />

            {/* Customer Routes - Protected and role-based */}
            <Route
              path="/customer"
              element={
                <RoleBasedRoute allowedRoles={["customer"]}>
                  <CustomerLayout />
                </RoleBasedRoute>
              }
            >
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="booking" element={<BookingPage />} />
              <Route
                path="booking-management"
                element={<BookingManagementPage />}
              />
              <Route path="menu" element={<MenuPage />} />
              <Route path="membership" element={<MembershipPage />} />
              <Route path="bills" element={<BillsPage />} />
              <Route path="profile" element={<CustomerProfilePage />} />
            </Route>

            {/* Staff Routes - Protected and role-based */}
            <Route
              path="/staff"
              element={
                <RoleBasedRoute allowedRoles={["manager", "waiter", "cashier"]}>
                  <StaffLayout />
                </RoleBasedRoute>
              }
            >
              {/* Manager Routes - Only managers can access */}
              <Route
                path="manager/dashboard"
                element={
                  <RoleBasedRoute allowedRoles={["manager"]}>
                    <ManagerDashboard />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="manager/tables"
                element={
                  <RoleBasedRoute allowedRoles={["manager"]}>
                    <TablesPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="manager/staff"
                element={
                  <RoleBasedRoute allowedRoles={["manager"]}>
                    <HRPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="manager/inventory"
                element={
                  <RoleBasedRoute allowedRoles={["manager"]}>
                    <InventoryPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="manager/menu"
                element={
                  <RoleBasedRoute allowedRoles={["manager"]}>
                    <MenuPromotionPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="manager/customers"
                element={
                  <RoleBasedRoute allowedRoles={["manager"]}>
                    <CustomersPage />
                  </RoleBasedRoute>
                }
              />

              {/* Cashier Routes - Cashiers and managers can access */}
              <Route
                path="cashier/invoices"
                element={
                  <RoleBasedRoute allowedRoles={["cashier", "manager"]}>
                    <InvoicesPage />
                  </RoleBasedRoute>
                }
              />

              {/* Waiter Routes - Waiters and managers can access */}
              <Route
                path="waiter/tables"
                element={
                  <RoleBasedRoute allowedRoles={["waiter", "manager"]}>
                    <TablesMapPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="waiter/orders"
                element={
                  <RoleBasedRoute allowedRoles={["waiter", "manager"]}>
                    <OrderingPage />
                  </RoleBasedRoute>
                }
              />

              {/* Common Staff Route */}
              <Route path="profile" element={<ProfilePage role="manager" />} />
            </Route>

            {/* Default Route - Smart redirect to customer home */}
            <Route
              path="/"
              element={<Navigate to="/customer/home" replace />}
            />

            {/* 404 - Catch all invalid routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
