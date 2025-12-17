import { useNavigate } from "react-router-dom";
import { Search, Home } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * NotFoundPage (404) - Hiển thị khi route không tồn tại
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          {/* <Search className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1> */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Không tìm thấy trang
          </h2>
          <p className="text-gray-600 mb-6">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/")}
            fullWidth
            size="lg"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Button>

          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            fullWidth
            size="lg"
          >
            Quay lại trang trước
          </Button>
        </div>

        {/* <div className="mt-8 text-sm text-gray-500">
          <p>Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ</p>
          <a
            href="mailto:support@restaurant.com"
            className="text-[#625EE8] hover:underline"
          >
            support@restaurant.com
          </a>
        </div> */}
      </div>
    </div>
  );
}
