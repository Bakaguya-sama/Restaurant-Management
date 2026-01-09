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
import { useEmailVerification } from "../../hooks/useEmailVerification";
import { Customer } from "../../lib/customerApi";
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

export function CustomerProfilePage() {
  const { userProfile, isAuthenticated, updateProfile } = useAuth();
  const { getCustomerById, updateCustomer } = useCustomers();
  const { resendVerificationEmail, loading: isResendingVerification, error: resendError, remainingCooldown: backendCooldown } = useEmailVerification();
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [emailJustChanged, setEmailJustChanged] = useState(false);
  const [verificationCooldown, setVerificationCooldown] = useState(0);
  const hasJustSavedRef = React.useRef(false);
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
        
        if (!isAuthenticated || !userProfile) {
          console.log('[CUSTOMER_PROFILE] User not authenticated or no profile in context');
          toast.error("Vui lòng đăng nhập để xem hồ sơ");
          setIsLoadingProfile(false);
          return;
        }

        if (hasJustSavedRef.current) {
          console.log('[CUSTOMER_PROFILE] Skipping refetch after save');
          setIsLoadingProfile(false);
          hasJustSavedRef.current = false;
          return;
        }

        const currentUserId = userProfile.id;
        console.log('[CUSTOMER_PROFILE] Loading profile for user ID:', currentUserId);
        
        try {
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
              setAvatarUrl(customer.image_url);
            }
          }
        } catch (apiError: any) {
          console.warn("[CUSTOMER_PROFILE] Failed to fetch customer data from API, using AuthContext fallback:", apiError);
          
          setCurrentCustomer({
            id: userProfile.id,
            full_name: userProfile.name || "",
            email: userProfile.email || "",
            phone: userProfile.phone || "",
            address: userProfile.address || "",
            membership_level: userProfile.membership_level || "regular",
            points: userProfile.points || 0,
            total_spent: userProfile.total_spent || 0,
            isBanned: userProfile.isBanned || false,
            image_url: userProfile.image_url,
            created_at: "",
            updated_at: ""
          } as any);
          
          setProfileData({
            fullName: userProfile.name || "",
            email: userProfile.email || "",
            phone: userProfile.phone || "",
            address: userProfile.address || "",
            dateOfBirth: "",
            memberSince: "",
          });
          
          if (userProfile.image_url) {
            setAvatarUrl(userProfile.image_url);
          }
        }
      } catch (error: any) {
        console.error("[CUSTOMER_PROFILE] Error loading customer profile:", error);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isAuthenticated && userProfile?.id) {
      loadCurrentCustomerProfile();
    }
  }, [isAuthenticated, userProfile?.id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (verificationCooldown > 0) {
      interval = setInterval(() => {
        setVerificationCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [verificationCooldown]);

  const handleResendVerificationEmail = async () => {
    if (!currentCustomer) return;
    
    try {
      await resendVerificationEmail(currentCustomer.email);
      toast.success("Email xác thực đã được gửi!");
      setVerificationCooldown(60);
    } catch (error: any) {
      const errorMessage = error.message || "Gửi email xác thực thất bại!";
      toast.error(errorMessage);
      // If we got a cooldown error, use the backend's remaining cooldown time
      if (backendCooldown && backendCooldown > 0) {
        setVerificationCooldown(backendCooldown);
      }
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
  };

  const handleUploadAvatar = async (customerId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      const imageUrl = await uploadAvatarImage(avatarFile, customerId);
      return extractRelativePath(imageUrl);
    } catch (uploadError) {
      console.error("[CUSTOMER_PROFILE] Avatar upload failed:", uploadError);
      toast.error("Ảnh đại diện cập nhật thất bại, nhưng thông tin cá nhân sẽ được lưu");
      return null;
    }
  };

  const handleSaveProfile = async () => {
    const nameValidation = validateRequired(profileData.fullName, "Họ và tên");
    const emailValidation = profileData.email
      ? validateEmail(profileData.email)
      : { isValid: true };
    const phoneValidation = validateVietnamesePhone(profileData.phone);

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

    if (!currentCustomer) return;

    try {
      setIsSaving(true);
      const isoDateOfBirth = profileData.dateOfBirth ? convertDisplayDateToISO(profileData.dateOfBirth) : "";
      
      let newImageUrl: string | undefined = undefined;

      if (avatarFile) {
        const uploadedImageUrl = await handleUploadAvatar(currentCustomer.id);
        if (uploadedImageUrl) {
          newImageUrl = uploadedImageUrl;
        }
      }

      const updatePayload: any = {
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        date_of_birth: isoDateOfBirth,
      };

      const emailChanged = currentCustomer.email !== profileData.email;

      if (newImageUrl) {
        updatePayload.image_url = newImageUrl;
      }

      const updatedCustomer = await updateCustomer(currentCustomer.id, updatePayload);

      setCurrentCustomer(updatedCustomer);
      if (updatedCustomer.image_url) {
        const cacheBustedUrl = `${updatedCustomer.image_url}?t=${Date.now()}`;
        setAvatarUrl(cacheBustedUrl);
      }

      if (emailChanged) {
        setEmailJustChanged(true);
        setVerificationCooldown(60);
      }
      setAvatarFile(null);
      setProfileData({
        fullName: updatedCustomer.full_name || "",
        email: updatedCustomer.email || "",
        phone: updatedCustomer.phone || "",
        address: updatedCustomer.address || "",
        dateOfBirth: formatDateDisplay(updatedCustomer.date_of_birth) || "",
        memberSince: updatedCustomer.created_at ? new Date(updatedCustomer.created_at).toISOString().split('T')[0] : "",
      });

      hasJustSavedRef.current = true;
      const cacheBustedImageUrl = updatedCustomer.image_url ? `${updatedCustomer.image_url}?t=${Date.now()}` : undefined;
      updateProfile({
        name: updatedCustomer.full_name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        image_url: cacheBustedImageUrl,
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
        setAvatarUrl(currentCustomer.image_url);
      } else {
        setAvatarUrl(null);
      }
    }
  };

  const handleChangePassword = async () => {
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

    if (!currentCustomer) return;

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
      console.error("[CUSTOMER_PROFILE] Error changing password:", error);
      const errorMessage = error.message || "Đổi mật khẩu thất bại!";
      toast.error(errorMessage);
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
                  <div className="w-32 h-32 bg-[#625EE8] rounded-full flex items-center justify-center mx-auto overflow-hidden relative">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} />
                    ) : (
                      <User className="w-16 h-16 text-white" />
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
                  label="Email (tùy chọn)"
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
                    label="Ngày sinh (tùy chọn)"
                    type="date"
                    value={profileData.dateOfBirth ? convertDisplayDateToISO(profileData.dateOfBirth) : ""}
                    onChange={(e) => {
                      const isoDate = e.target.value;
                      if (isoDate) {
                        setProfileData({
                          ...profileData,
                          dateOfBirth: formatDateDisplay(isoDate) || "",
                        });
                      } else {
                        setProfileData({
                          ...profileData,
                          dateOfBirth: "",
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
                    label="Địa chỉ (tùy chọn)"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {emailJustChanged && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <p className="font-medium mb-2">Email đã được thay đổi</p>
                  <p className="mb-3">Vui lòng xác thực email mới của bạn. Email xác thực đã được gửi đến địa chỉ email mới của bạn.</p>
                  <Button
                    onClick={handleResendVerificationEmail}
                    disabled={verificationCooldown > 0 || isResendingVerification}
                    variant="secondary"
                    className="text-sm"
                  >
                    {verificationCooldown > 0
                      ? `Gửi lại sau ${verificationCooldown}s`
                      : isResendingVerification
                      ? "Đang gửi..."
                      : "Gửi lại email xác thực"}
                  </Button>
                </div>
              )}
              {!emailJustChanged && currentCustomer && !currentCustomer.is_email_verified && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  <p className="font-medium mb-3">Email chưa được xác thực</p>
                  <Button
                    onClick={handleResendVerificationEmail}
                    disabled={verificationCooldown > 0 || isResendingVerification}
                    variant="secondary"
                    className="text-sm"
                  >
                    {verificationCooldown > 0
                      ? `Gửi lại sau ${verificationCooldown}s`
                      : isResendingVerification
                      ? "Đang gửi..."
                      : "Gửi email xác thực"}
                  </Button>
                </div>
              )}
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
