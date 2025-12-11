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

export function CustomerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
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

  const membershipInfo = {
    tier: "Gold",
    points: 1500,
    nextTier: "Platinum",
    pointsToNextTier: 500,
    totalSpent: 15800000,
  };

  const handleSaveProfile = () => {
    toast.success("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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
                <div className="w-32 h-32 bg-gradient-to-br from-[#0056D2] to-[#0041A3] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl">
                    {profileData.fullName.charAt(0)}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <h3 className="mb-2">{profileData.fullName}</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  {membershipInfo.tier}
                </span>
              </div>
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

          {/* Membership Card */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h4>Thông tin hạng thành viên</h4>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Điểm hiện tại</span>
                  <span className="text-[#0056D2]">
                    {membershipInfo.points} điểm
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#0056D2] h-2 rounded-full"
                    style={{
                      width: `${
                        (membershipInfo.points /
                          (membershipInfo.points +
                            membershipInfo.pointsToNextTier)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Còn {membershipInfo.pointsToNextTier} điểm để lên hạng{" "}
                  {membershipInfo.nextTier}
                </p>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Tổng chi tiêu</span>
                  <span className="text-[#0056D2]">
                    {membershipInfo.totalSpent.toLocaleString()}đ
                  </span>
                </div>
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

          {/* Preferences */}
          <Card className="p-6">
            <h3 className="mb-6">Tùy chọn</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Nhận thông báo khuyến mãi</p>
                  <p className="text-sm text-gray-600">
                    Nhận email về các chương trình ưu đãi
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056D2]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>Nhận thông báo đơn hàng</p>
                  <p className="text-sm text-gray-600">
                    Cập nhật trạng thái đặt bàn và order
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056D2]"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
