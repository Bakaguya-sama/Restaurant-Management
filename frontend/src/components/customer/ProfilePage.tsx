import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Save,
  X,
  Star,
  Award,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { toast } from "sonner";
import {
  validateEmail,
  validateVietnamesePhone,
  validateRequired,
  validatePassword,
  validatePasswordMatch,
} from "../../lib/validation";

export function CustomerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn An",
    email: "customer@email.com",
    phone: "0912345678",
    address: "123 Đường XYZ, Quận 1, TP.HCM",
    dateOfBirth: "1995-05-20",
    memberSince: "2023-01-15",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      toast.success("Ảnh đại diện đã được cập nhật");
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = () => {
    // Validate all fields
    const nameValidation = validateRequired(profileData.fullName, "Họ và tên");
    const emailValidation = validateEmail(profileData.email);
    const phoneValidation = validateVietnamesePhone(profileData.phone);
    const addressValidation = validateRequired(profileData.address, "Địa chỉ");

    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    if (!emailValidation.isValid) {
      toast.error(emailValidation.error);
      return;
    }

    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }

    if (!addressValidation.isValid) {
      toast.error(addressValidation.error);
      return;
    }

    toast.success("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Validate current password
    const currentPasswordValidation = validateRequired(
      passwordData.currentPassword,
      "Mật khẩu hiện tại"
    );
    if (!currentPasswordValidation.isValid) {
      toast.error(currentPasswordValidation.error);
      return;
    }

    // Validate new password
    const newPasswordValidation = validatePassword(passwordData.newPassword);
    if (!newPasswordValidation.isValid) {
      toast.error(newPasswordValidation.error);
      return;
    }

    // Validate password match
    const passwordMatchValidation = validatePasswordMatch(
      passwordData.newPassword,
      passwordData.confirmPassword
    );
    if (!passwordMatchValidation.isValid) {
      toast.error(passwordMatchValidation.error);
      return;
    }

    toast.success("Đổi mật khẩu thành công!");
    setShowPasswordChange(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2>Hồ sơ cá nhân</h2>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin tài khoản và membership của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-[#0056D2] to-[#0041A3] rounded-full flex items-center justify-center mx-auto overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl">
                      {profileData.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  title="Chọn ảnh đại diện"
                >
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <h3 className="mb-2">{profileData.fullName}</h3>
              <p className="text-sm text-gray-500">
                Thành viên từ{" "}
                {new Date(profileData.memberSince).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 line-clamp-2">
                  {profileData.address}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Thông tin cá nhân</h3>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                disabled={!isEditing}
              />
              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                disabled={!isEditing}
              />
              <Input
                label="Số điện thoại"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                disabled={!isEditing}
              />
              <Input
                label="Ngày sinh"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    dateOfBirth: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
              <div className="md:col-span-2">
                <Input
                  label="Địa chỉ"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>

          {/* Password Change */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Bảo mật</h3>
              {!showPasswordChange && (
                <Button
                  variant="secondary"
                  onClick={() => setShowPasswordChange(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              )}
            </div>

            {showPasswordChange ? (
              <div className="space-y-4">
                <Input
                  label="Mật khẩu hiện tại"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <Input
                  label="Mật khẩu mới"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Nhập mật khẩu mới"
                />
                <Input
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Nhập lại mật khẩu mới"
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Hủy
                  </Button>
                  <Button fullWidth onClick={handleChangePassword}>
                    Xác nhận đổi mật khẩu
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                Để bảo mật tài khoản, bạn nên thay đổi mật khẩu định kỳ và sử
                dụng mật khẩu mạnh.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
