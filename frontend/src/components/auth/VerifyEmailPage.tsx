import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { toast } from "sonner";
import { useEmailVerification } from "../../hooks/useEmailVerification";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useEmailVerification();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleVerifyEmail = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        setError("Token xác thực không được tìm thấy");
        setIsVerifying(false);
        return;
      }

      try {
        setIsVerifying(true);
        await verifyEmail(token);
        setIsSuccess(true);
        toast.success("Email đã được xác thực thành công!");
      } catch (err: any) {
        const errorMessage = err.message || "Xác thực email thất bại";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    };

    handleVerifyEmail();
  }, [searchParams, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#625EE8] to-[#7B6FFF] px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {isVerifying ? (
          <>
            <div className="animate-spin mb-4 flex justify-center">
              <div className="w-12 h-12 border-4 border-[#625EE8] border-t-transparent rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Đang xác thực email...
            </h1>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Xác thực thành công!
            </h1>
            <p className="text-gray-600 mb-8">
              Email của bạn đã được xác thực. Bây giờ bạn có thể đăng nhập vào tài khoản của mình.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Quay lại Đăng nhập
            </Button>
          </>
        ) : (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Xác thực thất bại
            </h1>
            <p className="text-gray-600 mb-2">
              {error}
            </p>
            <p className="text-gray-600 mb-8">
              Link xác thực có thể đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Quay lại Đăng nhập
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
