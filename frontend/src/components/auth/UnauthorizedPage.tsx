import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

/**
 * UnauthorizedPage (403) - Hiển thị khi user không có quyền truy cập
 */
export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();

  const handleGoBack = () => {
    // Redirect based on user role
    if (userProfile?.role === "customer") {
      navigate("/customer/home");
    } else if (userProfile?.role) {
      navigate("/staff/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="w-24 h-24 text-amber-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị
            viên nếu bạn nghĩ đây là lỗi.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleGoBack} fullWidth size="lg">
            Quay về trang chủ
          </Button>

          <Button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            variant="secondary"
            fullWidth
            size="lg"
          >
            Đăng nhập tài khoản khác
          </Button>
        </div>

        {userProfile && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Đang đăng nhập với: <strong>{userProfile.name}</strong>
              <br />
              Vai trò: <strong>{userProfile.role}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
