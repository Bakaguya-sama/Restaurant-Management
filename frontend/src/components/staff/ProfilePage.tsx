import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Lock, Camera, Save, X } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { toast } from "sonner";
import { UserRole } from "../../types";

interface ProfilePageProps {
  role: UserRole;
}

export function ProfilePage({ role }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn A",
    email: "nhanvien@restaurant.com",
    phone: "0912345678",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    dateOfBirth: "1990-01-15",
    position:
      role === "manager"
        ? "Quản lý"
        : role === "cashier"
        ? "Thu ngân"
        : "Phục vụ",
    employeeId: "NV001",
    joinDate: "2020-01-01",
    department: role === "manager" ? "Quản lý" : "Vận hành",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handleSaveProfile = () => {
    toast.success("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original data
  };

  const handleChangePassword = () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2>Quản lý hồ sơ cá nhân</h2>
        <p className="text-gray-600 mt-1">
          Xem và cập nhật thông tin cá nhân của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card className="p-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-[#0056D2] rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-4xl">
                  {profileData.fullName.charAt(0)}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50">
                <Camera className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <h3 className="mb-2">{profileData.fullName}</h3>
            <p className="text-gray-600 mb-1">{profileData.position}</p>
            <p className="text-sm text-gray-500">
              ID: {profileData.employeeId}
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

          {/* Work Information */}
          <Card className="p-6">
            <h3 className="mb-6">Thông tin công việc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Mã nhân viên"
                value={profileData.employeeId}
                disabled
              />
              <Input label="Chức vụ" value={profileData.position} disabled />
              <Input
                label="Phòng ban"
                value={profileData.department}
                disabled
              />
              <Input
                label="Ngày vào làm"
                type="date"
                value={profileData.joinDate}
                disabled
              />
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
