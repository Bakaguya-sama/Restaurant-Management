import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * RoleBasedRoute - Route Guard kiểm tra role/permissions
 * Chỉ cho phép user có role phù hợp truy cập
 * Redirect về trang unauthorized hoặc trang chỉ định nếu không có quyền
 */
export function RoleBasedRoute({
  children,
  allowedRoles,
  redirectTo = "/unauthorized",
}: RoleBasedRouteProps) {
  const { isAuthenticated, userProfile } = useAuth();

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không có role phù hợp
  if (userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
