import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Route Guard kiểm tra authentication
 * Chỉ cho phép user đã đăng nhập truy cập
 * Redirect về /login nếu chưa đăng nhập
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    // After login, can redirect back to this location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
