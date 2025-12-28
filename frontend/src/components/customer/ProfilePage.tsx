import React, { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { toast } from "sonner";
import { useCustomers } from "../../hooks/useCustomers";
import { Customer } from "../../lib/customerApi";
import { authService } from "../../lib/authService";
import { formatDateDisplay, convertDisplayDateToISO } from "../../lib/utils";
import { uploadAvatarImage, buildImageUrl, extractRelativePath } from "../../lib/uploadApi";
import {
  validateEmail,
  validateVietnamesePhone,
  validateRequired,
  validatePassword,
  validatePasswordMatch,
} from "../../lib/validation";

const PLACEHOLDER_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

export function CustomerProfilePage() {
  const { getCustomerById, updateCustomer } = useCustomers();
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    memberSince: "",
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

  useEffect(() => {
    const loadCurrentCustomerProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await authService.getCurrentUser();
        const currentUserId = response.data.id || response.data._id;
        
        if (currentUserId) {
          const customer = await getCustomerById(currentUserId);
          if (customer) {
            setCurrentCustomer(customer);
            setProfileData({
              fullName: customer.full_name || "",
              email: customer.email || "",
              phone: customer.phone || "",
              address: customer.address || "",
              dateOfBirth: formatDateDisplay(customer.date_of_birth) || "",
              memberSince: customer.created_at ? new Date(customer.created_at).toISOString().split('T')[0] : "",
            });
            if (customer.image_url) {
              setAvatarUrl(buildImageUrl(customer.image_url));
            }
          }
        }
      } catch (error) {
        console.error("[CUSTOMER_PROFILE] Error loading current customer profile:", error);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadCurrentCustomerProfile();
  }, []);

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
  };

  const handleUploadAvatar = async (customerId: string): Promise<void> => {
    if (!avatarFile) return;

    try {
      const imageUrl = await uploadAvatarImage(avatarFile, customerId);
      const relativePath = extractRelativePath(imageUrl);
      await updateCustomer(customerId, {
        image_url: relativePath,
      });
      setAvatarFile(null);
      if (currentCustomer) {
        setCurrentCustomer({
          ...currentCustomer,
          image_url: relativePath,
        });
        setAvatarUrl(buildImageUrl(relativePath));
      }
    } catch (uploadError) {
      console.error("[CUSTOMER_PROFILE] Avatar upload failed:", uploadError);
      toast.error("Ảnh đại diện cập nhật thất bại, nhưng thông tin cá nhân đã lưu");
    }
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

    if (!currentCustomer) return;

    try {
      setIsSaving(true);
      const isoDateOfBirth = profileData.dateOfBirth ? convertDisplayDateToISO(profileData.dateOfBirth) : "";
      
      const updatedCustomer = await updateCustomer(currentCustomer.id, {
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        date_of_birth: isoDateOfBirth,
      });

      if (avatarFile) {
        await handleUploadAvatar(currentCustomer.id);
      }

      setCurrentCustomer(updatedCustomer);
      setProfileData({
        fullName: updatedCustomer.full_name || "",
        email: updatedCustomer.email || "",
        phone: updatedCustomer.phone || "",
        address: updatedCustomer.address || "",
        dateOfBirth: formatDateDisplay(updatedCustomer.date_of_birth) || "",
        memberSince: updatedCustomer.created_at ? new Date(updatedCustomer.created_at).toISOString().split('T')[0] : "",
      });
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("[CUSTOMER_PROFILE] Error saving profile:", error);
      toast.error("Cập nhật thông tin thất bại!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    if (currentCustomer) {
      setProfileData({
        fullName: currentCustomer.full_name || "",
        email: currentCustomer.email || "",
        phone: currentCustomer.phone || "",
        address: currentCustomer.address || "",
        dateOfBirth: formatDateDisplay(currentCustomer.date_of_birth) || "",
        memberSince: currentCustomer.created_at || "",
      });
      if (currentCustomer.image_url) {
        setAvatarUrl(buildImageUrl(currentCustomer.image_url));
      } else {
        setAvatarUrl(null);
      }
    }
  };

  const handleChangePassword = async () => {
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

    if (!currentCustomer) return;

    try {
      setIsChangingPassword(true);
      await authService.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      toast.success("Đổi mật khẩu thành công!");
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("[CUSTOMER_PROFILE] Error changing password:", error);
      toast.error("Đổi mật khẩu thất bại!");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2>Hồ sơ cá nhân</h2>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {isLoadingProfile ? (
        <div className="flex items-center justify-center min-h-96">
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Profile Card */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-[#625EE8] rounded-full flex items-center justify-center mx-auto overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onLoad={() => {
                          setAvatarLoading(false);
                        }}
                        onError={() => {
                          setAvatarLoading(false);
                          setAvatarUrl(PLACEHOLDER_AVATAR);
                        }}
                        onLoadStart={() => {
                          setAvatarLoading(true);
                        }}
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
                <p className="text-sm text-gray-500">
                  Thành viên từ{" "}
                  {formatDateDisplay(profileData.memberSince)}
                </p>
              </div>
            </Card>
          </div>

          {/* Information Form */}
          <div className=" space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3>Thông tin cá nhân</h3>
                {!isEditing ? (
                  <Button onClick={handleEditMode}>Chỉnh sửa</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
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
                    value={profileData.dateOfBirth ? convertDisplayDateToISO(profileData.dateOfBirth) : ""}
                    onChange={(e) => {
                      const isoDate = e.target.value;
                      if (isoDate) {
                        setProfileData({
                          ...profileData,
                          dateOfBirth: formatDateDisplay(isoDate) || "",
                        });
                      }
                    }}
                  />
                ) : (
                  <Input
                    label="Ngày sinh"
                    value={profileData.dateOfBirth}
                    disabled
                  />
                )}
                {/* <Input
                  label="Ngày sinh"
                  type="date"
                  value={isEditing ? profileData.dateOfBirth : dateOfBirthDisplay}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      dateOfBirth: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                /> */}
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
                      disabled={isChangingPassword}
                    >
                      Hủy
                    </Button>
                    <Button
                      fullWidth
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                    >
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
