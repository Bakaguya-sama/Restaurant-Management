import React, { useState, useEffect } from "react";
import { Lock, Camera, Save, X, Eye, EyeOff } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { toast } from "sonner";
import { UserRole } from "../../types";
import { useStaff } from "../../hooks/useStaff";
import { Staff } from "../../lib/staffApi";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../lib/authService";
import { formatDateDisplay, convertDisplayDateToISO } from "../../lib/utils";
import { uploadAvatarImage, buildImageUrl, extractRelativePath } from "../../lib/uploadApi";
import { useImageLoader } from "../../hooks/useImageLoader";
import {
  validateEmail,
  validateVietnamesePhone,
  validateRequired,
  validatePassword,
  validatePasswordMatch,
} from "../../lib/validation";

interface ProfilePageProps {
  role: UserRole;
}

const PLACEHOLDER_AVATAR = "/placeholder_images/placeholder_avatar_image.png";

function AvatarImage({ src }: { src: string | null }) {
  
  if (src?.startsWith("data:")) {
    return (
      <img
        src={src}
        alt="Avatar"
        className="w-full h-full object-cover"
      />
    );
  }
  
  
  const displayImage = useImageLoader(src, PLACEHOLDER_AVATAR);
  return (
    <img
      src={displayImage}
      alt="Avatar"
      className="w-full h-full object-cover"
    />
  );
}

export function ProfilePage({ role }: ProfilePageProps) {
  const { userProfile, isAuthenticated } = useAuth();
  const { staff, loading, getStaffById } = useStaff();
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    position: "",
    employeeId: "",
    joinDate: "",
    department: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const { updateStaff } = useStaff();

  useEffect(() => {
    const loadCurrentStaffProfile = async () => {
      try {
        setIsLoadingProfile(true);
        
        if (!isAuthenticated || !userProfile) {
          console.log('[STAFF_PROFILE] User not authenticated or no profile in context');
          toast.error("Vui lòng đăng nhập để xem hồ sơ");
          setIsLoadingProfile(false);
          return;
        }

        const currentUserId = userProfile.id;
        console.log('[STAFF_PROFILE] Loading profile for user ID:', currentUserId);
        
        try {
          const staffMember = await getStaffById(currentUserId);
          if (staffMember) {
            setCurrentStaff(staffMember);
            setProfileData({
              fullName: staffMember.full_name || "",
              email: staffMember.email || "",
              phone: staffMember.phone || "",
              address: staffMember.address || "",
              dateOfBirth: formatDateDisplay(staffMember.date_of_birth) || "",
              position: getRoleLabel(staffMember.role),
              employeeId: staffMember.id || "",
              joinDate: formatDateDisplay(staffMember.hire_date) || "",
              department: getRoleDepartment(staffMember.role),
            });
            if (staffMember.image_url) {
              setAvatarUrl(staffMember.image_url);
            }
          }
        } catch (apiError: any) {
          console.warn("[STAFF_PROFILE] Failed to fetch staff data from API, using AuthContext fallback:", apiError);
          
          setCurrentStaff({
            id: userProfile.id,
            full_name: userProfile.name || "",
            email: userProfile.email || "",
            phone: userProfile.phone || "",
            address: userProfile.address || "",
            role: userProfile.role || "waiter",
            image_url: userProfile.image_url,
            hire_date: "",
            date_of_birth: "",
            created_at: "",
            updated_at: ""
          } as any);
          
          setProfileData({
            fullName: userProfile.name || "",
            email: userProfile.email || "",
            phone: userProfile.phone || "",
            address: userProfile.address || "",
            dateOfBirth: "",
            position: getRoleLabel(userProfile.role || "waiter"),
            employeeId: userProfile.id || "",
            joinDate: "",
            department: getRoleDepartment(userProfile.role || "waiter"),
          });
          
          if (userProfile.image_url) {
            setAvatarUrl(userProfile.image_url);
          }
        }
      } catch (error: any) {
        console.error("[STAFF_PROFILE] Error loading staff profile:", error);
        toast.error("Không thể tải hồ sơ cá nhân");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadCurrentStaffProfile();
  }, [isAuthenticated, userProfile]);

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "manager":
        return "Quản lý";
      case "cashier":
        return "Thu ngân";
      case "waiter":
        return "Phục vụ";
      default:
        return role;
    }
  };

  const getRoleDepartment = (role: string): string => {
    switch (role) {
      case "manager":
        return "Quản lý";
      default:
        return "Vận hành";
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      toast.success("Ảnh đại diện sẽ được cập nhật khi lưu");
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditMode = () => {
    setIsEditing(true);
    setProfileData(prev => ({
      ...prev,
      dateOfBirth: convertDisplayDateToISO(prev.dateOfBirth),
      joinDate: convertDisplayDateToISO(prev.joinDate),
    }));
  };

  const handleSaveProfile = async () => {
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

    if (!currentStaff) return;

    try {
      setIsSaving(true);
      await updateStaff(currentStaff.id, {
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        date_of_birth: profileData.dateOfBirth,
        hire_date: profileData.joinDate,
      });

      if (avatarFile) {
        try {
          const imageUrl = await uploadAvatarImage(avatarFile, currentStaff.id);
          const relativePath = extractRelativePath(imageUrl);
          await updateStaff(currentStaff.id, {
            image_url: relativePath,
          });
          setAvatarFile(null);
        } catch (uploadError) {
          console.error("Avatar upload failed:", uploadError);
          toast.error("Ảnh đại diện cập nhật thất bại, nhưng thông tin cá nhân đã lưu");
        }
      }

      setProfileData(prev => ({
        ...prev,
        dateOfBirth: formatDateDisplay(profileData.dateOfBirth),
        joinDate: formatDateDisplay(profileData.joinDate),
      }));
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Cập nhật thông tin thất bại!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    if (currentStaff) {
      setProfileData({
        fullName: currentStaff.full_name || "",
        email: currentStaff.email || "",
        phone: currentStaff.phone || "",
        address: currentStaff.address || "",
        dateOfBirth: formatDateDisplay(currentStaff.date_of_birth) || "",
        position: getRoleLabel(currentStaff.role),
        employeeId: currentStaff.id || "",
        joinDate: formatDateDisplay(currentStaff.hire_date) || "",
        department: getRoleDepartment(currentStaff.role),
      });
      if (currentStaff.image_url) {
        setAvatarUrl(currentStaff.image_url);
      }
    }
  };

  const handleChangePassword = async () => {
    // Check authentication first
    if (!isAuthenticated || !userProfile) {
      toast.error("Vui lòng đăng nhập để đổi mật khẩu");
      return;
    }

    const currentPasswordValidation = validateRequired(
      passwordData.currentPassword,
      "Mật khẩu hiện tại"
    );
    if (!currentPasswordValidation.isValid) {
      toast.error(currentPasswordValidation.error);
      return;
    }

    const newPasswordValidation = validatePassword(passwordData.newPassword);
    if (!newPasswordValidation.isValid) {
      toast.error(newPasswordValidation.error);
      return;
    }

    const passwordMatchValidation = validatePasswordMatch(
      passwordData.newPassword,
      passwordData.confirmPassword
    );
    if (!passwordMatchValidation.isValid) {
      toast.error(passwordMatchValidation.error);
      return;
    }

    if (!currentStaff) return;

    try {
      setIsChangingPassword(true);
      await authService.changePassword({ 
        currentPassword: passwordData.currentPassword, 
        newPassword: passwordData.newPassword 
      });
      toast.success("Đổi mật khẩu thành công!");
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Change password error:", error);
      const errorMessage = error.message || "Đổi mật khẩu thất bại!";
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2>Quản lý hồ sơ cá nhân</h2>
        <p className="text-gray-600 mt-1">
          Xem và cập nhật thông tin cá nhân của bạn
        </p>
      </div>

      {isLoadingProfile ? (
        <div className="flex items-center justify-center min-h-96">
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-[#625EE8] rounded-full flex items-center justify-center mx-auto overflow-hidden">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} />
                    ) : (
                      <span className="text-white text-4xl">
                        {profileData.fullName.charAt(0) || "?"}
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
                  {isEditing && (
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      title="Chọn ảnh đại diện"
                    >
                      <Camera className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>
                <h3 className="mb-2">{profileData.fullName}</h3>
                <p className="text-gray-600 mb-1">{profileData.position}</p>
                <p className="text-sm text-gray-500">
                  ID: {profileData.employeeId}
                </p>
              </div>
            </Card>
          </div>

          <div className=" space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3>Thông tin cá nhân</h3>
                {!isEditing ? (
                  <Button onClick={handleEditMode}>Chỉnh sửa</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Đang lưu..." : "Lưu"}
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
                {isEditing ? (
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
                  />
                ) : (
                  <Input
                    label="Ngày sinh"
                    value={profileData.dateOfBirth}
                    disabled
                  />
                )}
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
                {isEditing ? (
                  <Input
                    label="Ngày vào làm"
                    type="date"
                    value={profileData.joinDate}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        joinDate: e.target.value,
                      })
                    }
                    disabled
                  />
                ) : (
                  <Input
                    label="Ngày vào làm"
                    value={profileData.joinDate}
                    disabled
                  />
                )}
              </div>
            </Card>

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
                  <div className="relative">
                    <Input
                      label="Mật khẩu hiện tại"
                      type={showPasswordFields.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordFields({
                          ...showPasswordFields,
                          current: !showPasswordFields.current,
                        })
                      }
                      className="absolute right-3 top-8 text-gray-600 hover:text-gray-800"
                      title={showPasswordFields.current ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showPasswordFields.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      label="Mật khẩu mới"
                      type={showPasswordFields.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordFields({
                          ...showPasswordFields,
                          new: !showPasswordFields.new,
                        })
                      }
                      className="absolute right-3 top-8 text-gray-600 hover:text-gray-800"
                      title={showPasswordFields.new ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showPasswordFields.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      label="Xác nhận mật khẩu mới"
                      type={showPasswordFields.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordFields({
                          ...showPasswordFields,
                          confirm: !showPasswordFields.confirm,
                        })
                      }
                      className="absolute right-3 top-8 text-gray-600 hover:text-gray-800"
                      title={showPasswordFields.confirm ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showPasswordFields.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
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
                    <Button fullWidth onClick={handleChangePassword} disabled={isChangingPassword}>
                      {isChangingPassword ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
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
      )}
    </div>
  );
}
