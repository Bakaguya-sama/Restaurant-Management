import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "warning",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-red-600",
      bg: "bg-red-50",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: "text-yellow-600",
      bg: "bg-yellow-50",
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    info: {
      icon: "text-blue-600",
      bg: "bg-blue-50",
      confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const style = variantStyles[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-full ${style.bg} flex items-center justify-center mb-4`}
            >
              <AlertTriangle className={`w-8 h-8 ${style.icon}`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 mb-6">{message}</p>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <Button variant="secondary" fullWidth onClick={onClose}>
                {cancelText}
              </Button>
              <Button
                fullWidth
                onClick={handleConfirm}
                className={style.confirmBtn}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 
===========================================
CÁCH SỬ DỤNG CONFIRMATION MODAL
===========================================

1. Import component:
   import { ConfirmationModal } from '../../ui/ConfirmationModal';

2. Thêm state để quản lý modal:
   const [showConfirmModal, setShowConfirmModal] = useState(false);

3. Sử dụng trong JSX:
   
   VÍ DỤ 1: Xác nhận xóa (variant danger)
   <ConfirmationModal
     isOpen={showConfirmModal}
     onClose={() => setShowConfirmModal(false)}
     onConfirm={() => {
       // Logic xóa ở đây
       handleDelete(itemId);
       toast.success("Xóa thành công!");
     }}
     title="Xóa món ăn"
     message="Bạn có chắc chắn muốn xóa món ăn này? Hành động này không thể hoàn tác."
     confirmText="Xóa"
     cancelText="Hủy"
     variant="danger"
   />

   VÍ DỤ 2: Xác nhận đăng xuất (variant warning)
   <ConfirmationModal
     isOpen={showLogoutConfirm}
     onClose={() => setShowLogoutConfirm(false)}
     onConfirm={() => {
       logout();
       navigate("/login");
     }}
     title="Đăng xuất"
     message="Bạn có chắc chắn muốn đăng xuất?"
     confirmText="Đăng xuất"
     cancelText="Ở lại"
     variant="warning"
   />

   VÍ DỤ 3: Xác nhận thay đổi (variant info)
   <ConfirmationModal
     isOpen={showSaveConfirm}
     onClose={() => setShowSaveConfirm(false)}
     onConfirm={() => {
       handleSave();
     }}
     title="Lưu thay đổi"
     message="Bạn có muốn lưu các thay đổi này?"
     confirmText="Lưu"
     cancelText="Không lưu"
     variant="info"
   />

4. Trigger modal từ button/action:
   <Button
     onClick={() => setShowConfirmModal(true)}
     className="text-red-600"
   >
     Xóa
   </Button>

PROPS:
- isOpen: boolean - Điều khiển hiển thị modal
- onClose: () => void - Callback khi đóng modal
- onConfirm: () => void - Callback khi xác nhận (sẽ tự động đóng modal sau khi thực hiện)
- title?: string - Tiêu đề modal (mặc định: "Xác nhận")
- message?: string - Nội dung thông báo (mặc định: "Bạn có chắc chắn...")
- confirmText?: string - Text nút xác nhận (mặc định: "Xác nhận")
- cancelText?: string - Text nút hủy (mặc định: "Hủy")
- variant?: 'danger' | 'warning' | 'info' - Style variant (mặc định: 'warning')
  * danger: Màu đỏ - dùng cho các hành động nguy hiểm (xóa, hủy vĩnh viễn)
  * warning: Màu vàng - dùng cho cảnh báo (đăng xuất, rời khỏi trang)
  * info: Màu xanh - dùng cho thông tin (lưu, xác nhận thay đổi)

LƯU Ý:
- onConfirm sẽ tự động đóng modal sau khi thực hiện
- Có thể click overlay hoặc nút X để đóng modal
- Nên sử dụng toast để thông báo kết quả sau khi confirm
*/
