import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, CreditCard, CheckCircle, Upload } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Card } from "../ui/Card";
import { customerApi } from "../../lib/customerApi";
import { tableApi } from "../../lib/tableApi";
import { locationApi } from "../../lib/locationApi";
import { floorApi } from "../../lib/floorApi";
import { uploadDepositProofImage, extractRelativePath } from "../../lib/uploadApi";
import {
  Table,
  Reservation,
  ReservationData,
  Floor,
  Location,
} from "../../types";
import type { Customer } from "../../lib/customerApi";
import { useReservations } from "../../hooks/useReservations";
import { useFloors } from "../../hooks/useFloors";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import {
  validateFutureDate,
  validateNumberRange,
  validateInteger,
} from "../../lib/validation";

export function BookingPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { createReservation, updateReservationStatus, checkTableAvailability } =
    useReservations();
  const [step, setStep] = useState(1);
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTableIds, setAvailableTableIds] = useState<Set<string>>(
    new Set()
  );
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [createdReservation, setCreatedReservation] =
    useState<Reservation | null>(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    checkoutTime: "",
    guests: 2,
    name: "",
    phone: "",
    notes: "",
    tableId: "",
  });
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(
    null
  );
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>("all");
  const [selectedCapacityFilter, setSelectedCapacityFilter] = useState<string>("all");
  const [depositProofImage, setDepositProofImage] = useState<File | null>(null);
  const [depositProofPreview, setDepositProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          tablesResponse,
          customersResponse,
          floorsResponse,
          locationsResponse,
        ] = await Promise.all([
          tableApi.getAll(),
          customerApi.getAll({ isBanned: false }),
          floorApi.getAll(),
          locationApi.getAll(),
        ]);

        if (tablesResponse.success && tablesResponse.data) {
          setTables(tablesResponse.data);
          console.log("Tables loaded:", tablesResponse.data);
        } else {
          setError("Không thể tải danh sách bàn");
          toast.error("Không thể tải danh sách bàn");
        }

        if (customersResponse.success && customersResponse.data) {
          setCustomers(customersResponse.data);
        } else {
          setError("Không thể tải danh sách khách hàng");
          toast.error("Không thể tải danh sách khách hàng");
        }

        if (floorsResponse.success && floorsResponse.data) {
          setFloors(floorsResponse.data);
          console.log("Floors loaded:", floorsResponse.data);
        }

        if (locationsResponse.success && locationsResponse.data) {
          setLocations(locationsResponse.data);
          console.log("Locations loaded:", locationsResponse.data);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi khi tải dữ liệu";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Autofill name and phone from user profile
  useEffect(() => {
    if (userProfile?.name || userProfile?.phone) {
      setBookingData((prev) => ({
        ...prev,
        name: userProfile.name || prev.name,
        phone: userProfile.phone || prev.phone,
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (
      step === 2 &&
      bookingData.date &&
      bookingData.time &&
      bookingData.checkoutTime &&
      tables.length > 0
    ) {
      checkTableAvailabilityForAll();
    }
  }, [step, bookingData.date, bookingData.time, bookingData.checkoutTime]);

  const checkTableAvailabilityForAll = async () => {
    try {
      setCheckingAvailability(true);
      const availableIds = new Set<string>();

      for (const table of tables) {
        if (table.status === "free" || table.status === "reserved") {
          if (table.capacity >= bookingData.guests) {
            const result = await checkTableAvailability(
              table.id,
              bookingData.date,
              bookingData.time,
              bookingData.checkoutTime
            );
            if (result?.available) {
              availableIds.add(table.id);
            }
          }
        }
      }

      setAvailableTableIds(availableIds);
    } catch (err) {
      console.error("Error checking table availability:", err);
      toast.error("Lỗi khi kiểm tra tính sẵn có của bàn");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const isUserBanned = userProfile?.isBanned ?? false;

  const getFloorName = (locationId?: string) => {
    if (!locationId) return "N/A";

    const location = locations.find(
      (l) => l.id === locationId || (l as any)._id === locationId
    );
    if (!location) {
      console.warn(
        `Location not found for ID: ${locationId}. Available locations:`,
        locations
      );
      return "N/A";
    }

    const floorId = location.floor_id || (location as any).floor;
    if (!floorId) {
      console.warn(`Floor ID not found for location:`, location);
      return "N/A";
    }

    const floor = floors.find(
      (f) => f.id === floorId || (f as any)._id === floorId
    );
    if (!floor) {
      console.warn(
        `Floor not found for ID: ${floorId}. Available floors:`,
        floors
      );
      return floorId;
    }

    return floor.floor_name || "N/A";
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date || !time) return "N/A";

    let formattedDate = date;
    if (date.includes("T")) {
      formattedDate = date.split("T")[0];
    }

    let formattedTime = time;
    if (time.includes(":")) {
      formattedTime = time.split(":").slice(0, 2).join(":");
    }

    return `${formattedDate} ${formattedTime}`;
  };

  const availableTables = tables.filter((t) => {
    // Basic filters
    if (
      !(t.status === "free" || t.status === "reserved") ||
      t.capacity < bookingData.guests ||
      !availableTableIds.has(t.id)
    ) {
      return false;
    }

    // Floor filter
    if (selectedFloorFilter !== "all") {
      const location = locations.find(
        (l) => l.id === t.location_id || (l as any)._id === t.location_id
      );
      if (location) {
        const floorId = location.floor_id || (location as any).floor;
        if (floorId !== selectedFloorFilter) {
          return false;
        }
      } else {
        return false;
      }
    }

    // Capacity filter
    if (selectedCapacityFilter !== "all") {
      const capacity = parseInt(selectedCapacityFilter);
      if (t.capacity !== capacity) {
        return false;
      }
    }

    return true;
  });

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setBookingData({ ...bookingData, tableId: table.id });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 10MB');
        return;
      }
      setDepositProofImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setDepositProofPreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setDepositProofImage(null);
    if (depositProofPreview) {
      URL.revokeObjectURL(depositProofPreview);
      setDepositProofPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmBooking = async () => {
    if (!userProfile?.id) {
      toast.error("Vui lòng đăng nhập để đặt bàn");
      return;
    }

    if (!selectedTable) {
      toast.error("Vui lòng chọn bàn");
      return;
    }

    if (!bookingData.checkoutTime) {
      toast.error("Vui lòng chọn giờ kết thúc");
      return;
    }

    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!depositProofImage) {
      toast.error("Vui lòng upload ảnh xác nhận thanh toán");
      return;
    }

    try {
      setUploading(true);
      
      // Upload deposit proof image first
      const uploadedImageUrl = await uploadDepositProofImage(depositProofImage);
      const relativePath = extractRelativePath(uploadedImageUrl);

      const backendPaymentMethod =
        paymentMethod === "wallet" ? "transfer" : "card";

      const reservationData: ReservationData = {
        customer_id: userProfile.id,
        reservation_date: bookingData.date,
        reservation_time: bookingData.time,
        reservation_checkout_time: bookingData.checkoutTime,
        number_of_guests: bookingData.guests,
        deposit_amount: 200000,
        payment_method: backendPaymentMethod,
        deposit_proof_image: relativePath,
        special_requests: bookingData.notes,
        status: "pending", // Chờ cashier xác nhận
        isPaid: false,
        details: [
          {
            table_id: selectedTable.id,
          },
        ],
      };

      const reservation = await createReservation(reservationData);
      if (reservation) {
        setCreatedReservation(reservation);
        setShowSuccess(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi tạo đặt bàn";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const depositAmount = 200000;

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Card className="p-12 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          <h2 className="mb-4 text-yellow-600">Đặt bàn đang chờ xác nhận!</h2>
          <p className="text-gray-600 mb-4">
            Đơn đặt bàn của bạn đang chờ thu ngân xác nhận thanh toán cọc.
            Bạn sẽ nhận được thông báo khi đơn được xác nhận.
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-6xl mb-4">
              <div className="w-40 h-40 mx-auto bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 shadow-sm p-2">
                {createdReservation?.id ? (
                  <QRCodeSVG
                    value={createdReservation.id}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <span className="text-sm text-gray-400">QR Code</span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-2 text-center">Mã đặt bàn</p>
            <p className="text-2xl mb-4 text-center font-semibold">
              {createdReservation?.id || "BOOKING-001"}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 font-medium">
                Trạng thái: Chờ xác nhận thanh toán
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Ngày giờ</p>
                <p>
                  {formatDateTime(
                    createdReservation?.reservation_date,
                    createdReservation?.reservation_time
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Giờ kết thúc</p>
                <p>{createdReservation?.reservation_checkout_time || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">Số người</p>
                <p>{createdReservation?.number_of_guests} người</p>
              </div>
              <div>
                <p className="text-gray-600">Bàn số</p>
                <p>{selectedTable?.table_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Khu vực</p>
                <p>{getFloorName(selectedTable?.location_id)}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/customer/home")}>
              Về trang chủ
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                navigate("/customer/booking-management", {
                  state: { reservationId: createdReservation?.id },
                })
              }
            >
              Xem chi tiết
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2>Đặt bàn</h2>
        <p className="text-gray-600 mt-1">
          Đặt chỗ trước dễ dàng và nhanh chóng
        </p>
      </div>

      {/* Blacklist Warning */}
      {isUserBanned ? (
        <Card className="p-6 mb-6 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-red-800 mb-2">Tài khoản bị hạn chế</h3>
              <p className="text-red-700 mb-4">
                Tài khoản của bạn đang bị hạn chế do vi phạm chính sách. Bạn
                không thể đặt bàn trực tuyến.
              </p>
              <p className="text-sm text-red-600 mt-4">
                Vui lòng liên hệ trực tiếp nhà hàng để được hỗ trợ.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {["Chọn thời gian", "Chọn bàn", "Thông tin", "Thanh toán"].map(
              (label, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step > index + 1
                          ? "bg-green-500 text-white"
                          : step === index + 1
                          ? "bg-[#625EE8] text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step > index + 1 ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">{label}</span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-20 h-1 mx-2 ${
                        step > index + 1 ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            )}
          </div>

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <Card className="p-8">
              <h3 className="mb-6">Chọn ngày giờ đặt bàn</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Input
                  label="Ngày"
                  type="date"
                  icon={<Calendar className="w-4 h-4" />}
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  disabled={isUserBanned}
                />
                <Input
                  label="Giờ (8:00 - 20:00)"
                  type="time"
                  icon={<Clock className="w-4 h-4" />}
                  value={bookingData.time}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, time: e.target.value })
                  }
                  min="08:00"
                  max="20:00"
                  disabled={isUserBanned}
                />
                <Input
                  label="Giờ kết thúc (Tối đa 3h)"
                  type="time"
                  icon={<Clock className="w-4 h-4" />}
                  value={bookingData.checkoutTime}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      checkoutTime: e.target.value,
                    })
                  }
                  min="08:00"
                  max="20:00"
                  disabled={isUserBanned}
                />
                <Input
                  label="Số người"
                  type="number"
                  icon={<Users className="w-4 h-4" />}
                  value={bookingData.guests}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      guests: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="8"
                  step="1"
                  disabled={isUserBanned}
                />
              </div>
              <Button
                onClick={() => {
                  const dateValidation = validateFutureDate(
                    bookingData.date,
                    "Ngày đặt bàn"
                  );
                  if (!dateValidation.isValid) {
                    toast.error(dateValidation.error);
                    return;
                  }

                  if (!bookingData.time) {
                    toast.error("Vui lòng chọn giờ");
                    return;
                  }

                  const [year, month, day] = bookingData.date
                    .split("-")
                    .map(Number);
                  const [hour, minute] = bookingData.time
                    .split(":")
                    .map(Number);
                  const reservationDateTime = new Date(
                    year,
                    month - 1,
                    day,
                    hour,
                    minute
                  );
                  const now = new Date();

                  if (reservationDateTime <= now) {
                    toast.error("Ngày giờ đặt bàn phải trong tương lai");
                    return;
                  }

                  // Validate time range (8:00 AM - 8:00 PM)
                  if (bookingData.time) {
                    const [hours, minutes] = bookingData.time
                      .split(":")
                      .map(Number);
                    const timeInMinutes = hours * 60 + minutes;
                    const minTime = 8 * 60; // 8:00 AM
                    const maxTime = 20 * 60; // 8:00 PM

                    if (timeInMinutes < minTime || timeInMinutes > maxTime) {
                      toast.error(
                        "Giờ đặt bàn phải trong khoảng 8:00 sáng đến 8:00 tối"
                      );
                      return;
                    }
                  }

                  // Validate checkout time
                  if (!bookingData.checkoutTime) {
                    toast.error("Vui lòng chọn giờ kết thúc");
                    return;
                  }

                  if (bookingData.checkoutTime) {
                    const [hours, minutes] = bookingData.checkoutTime
                      .split(":")
                      .map(Number);
                    const timeInMinutes = hours * 60 + minutes;
                    const minTime = 8 * 60; // 8:00 AM
                    const maxTime = 20 * 60; // 8:00 PM

                    if (timeInMinutes < minTime || timeInMinutes > maxTime) {
                      toast.error(
                        "Giờ kết thúc phải trong khoảng 8:00 sáng đến 8:00 tối"
                      );
                      return;
                    }
                  }

                  if (bookingData.time && bookingData.checkoutTime) {
                    const [resHours, resMinutes] = bookingData.time
                      .split(":")
                      .map(Number);
                    const [checkoutHours, checkoutMinutes] =
                      bookingData.checkoutTime.split(":").map(Number);

                    const resTimeInMinutes = resHours * 60 + resMinutes;
                    const checkoutTimeInMinutes =
                      checkoutHours * 60 + checkoutMinutes;
                    const timeDifference =
                      checkoutTimeInMinutes - resTimeInMinutes;

                    if (timeDifference <= 0) {
                      toast.error("Giờ kết thúc phải sau giờ đặt bàn");
                      return;
                    }

                    if (timeDifference > 3 * 60) {
                      toast.error("Thời gian giữ bàn tối đa là 3 giờ");
                      return;
                    }
                  }

                  const guestsValidation = validateInteger(
                    bookingData.guests,
                    "Số người"
                  );
                  if (!guestsValidation.isValid) {
                    toast.error(guestsValidation.error);
                    return;
                  }

                  const guestsRangeValidation = validateNumberRange(
                    bookingData.guests,
                    1,
                    8,
                    "Số người"
                  );
                  if (!guestsRangeValidation.isValid) {
                    toast.error(guestsRangeValidation.error);
                    return;
                  }

                  setStep(2);
                }}
                disabled={
                  !bookingData.date ||
                  !bookingData.time ||
                  !bookingData.checkoutTime ||
                  isUserBanned
                }
              >
                Tiếp tục
              </Button>
            </Card>
          )}

          {/* Step 2: Select Table */}
          {step === 2 && (
            <div>
              <Card className="p-8 mb-6">
                <h3 className="mb-6">Chọn vị trí bàn</h3>
                
                {/* Filter Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">Lọc theo</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Khu vực
                      </label>
                      <select
                        value={selectedFloorFilter}
                        onChange={(e) => setSelectedFloorFilter(e.target.value)}
                        disabled={isUserBanned}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#625EE8] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="all">Tất cả khu vực</option>
                        {floors.map((floor) => (
                          <option key={floor.id} value={floor.id}>
                            {floor.floor_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Sức chứa
                      </label>
                      <select
                        value={selectedCapacityFilter}
                        onChange={(e) => setSelectedCapacityFilter(e.target.value)}
                        disabled={isUserBanned}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#625EE8] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="all">Tất cả sức chứa</option>
                        <option value="2">2 chỗ</option>
                        <option value="4">4 chỗ</option>
                        <option value="6">6 chỗ</option>
                        <option value="8">8 chỗ</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Đang tải danh sách bàn...</p>
                  </div>
                ) : checkingAvailability ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Đang kiểm tra tính sẵn có...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <Button
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Tải lại trang
                    </Button>
                  </div>
                ) : availableTables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {availableTables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => handleTableSelect(table)}
                        disabled={isUserBanned}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isUserBanned
                            ? "opacity-50 cursor-not-allowed"
                            : selectedTable?.id === table.id
                            ? "border-[#625EE8] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          <p className="mb-1">{table.table_number}</p>
                          <p className="text-sm text-gray-600">
                            {getFloorName(table.location_id)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {table.capacity} chỗ ngồi
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">
                      Không có bàn phù hợp cho {bookingData.guests} người vào
                      thời gian này
                    </p>
                  </div>
                )}
              </Card>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Quay lại
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={
                    !selectedTable || isUserBanned || checkingAvailability
                  }
                >
                  Tiếp tục
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Information */}
          {step === 3 && (
            <div>
              <Card className="p-8 mb-6">
                <h3 className="mb-6">Thông tin đặt bàn</h3>
                <div className="space-y-4 mb-6">
                  <Input
                    label="Họ và tên"
                    value={bookingData.name}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, name: e.target.value })
                    }
                    placeholder="Nhập họ tên"
                    disabled={isUserBanned}
                  />
                  <Input
                    label="Số điện thoại"
                    value={bookingData.phone}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, phone: e.target.value })
                    }
                    placeholder="Nhập số điện thoại"
                    disabled={isUserBanned}
                  />
                  <Textarea
                    label="Ghi chú yêu cầu đặc biệt"
                    value={bookingData.notes}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, notes: e.target.value })
                    }
                    placeholder="VD: Cần ghế em bé, khu vực yên tĩnh..."
                    rows={3}
                    disabled={isUserBanned}
                  />
                </div>
              </Card>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Quay lại
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={
                    !bookingData.name || !bookingData.phone || isUserBanned
                  }
                >
                  Tiếp tục
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div>
              <Card className="p-8 mb-6">
                <h3 className="mb-6">Thanh toán cọc</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    Bạn cần thanh toán tiền cọc {depositAmount.toLocaleString()}
                    đ để hoàn tất đặt bàn
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod("wallet")}
                      disabled={isUserBanned}
                      className={`p-4 border-2 rounded-lg text-left transition cursor-pointer ${
                        isUserBanned
                          ? "opacity-50 cursor-not-allowed"
                          : paymentMethod === "wallet"
                          ? "border-[#625EE8] bg-blue-50 hover:bg-blue-100"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <CreditCard
                        className={`w-6 h-6 mb-2 ${
                          paymentMethod === "wallet"
                            ? "text-[#625EE8]"
                            : "text-gray-600"
                        }`}
                      />
                      <p>Ví điện tử</p>
                      <p className="text-sm text-gray-600">MoMo, ZaloPay</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      disabled={isUserBanned}
                      className={`p-4 border-2 rounded-lg text-left transition cursor-pointer ${
                        isUserBanned
                          ? "opacity-50 cursor-not-allowed"
                          : paymentMethod === "card"
                          ? "border-[#625EE8] bg-blue-50 hover:bg-blue-100"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <CreditCard
                        className={`w-6 h-6 mb-2 ${
                          paymentMethod === "card"
                            ? "text-[#625EE8]"
                            : "text-gray-600"
                        }`}
                      />
                      <p>Thẻ ngân hàng</p>
                      <p className="text-sm text-gray-600">ATM, Visa, Master</p>
                    </button>
                  </div>
                </div>

                {/* Upload ảnh xác nhận thanh toán */}
                <div className="border-t pt-6 mb-6">
                  <h4 className="mb-4">Upload ảnh xác nhận thanh toán</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Vui lòng chuyển khoản và upload ảnh xác nhận giao dịch để hoàn tất đặt bàn.
                    Thu ngân sẽ xác nhận thanh toán của bạn.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">Thông tin chuyển khoản:</p>
                    <p className="text-sm text-blue-700">Ngân hàng: VietcomBank</p>
                    <p className="text-sm text-blue-700">STK: 1234567890</p>
                    <p className="text-sm text-blue-700">Chủ TK: CONG TY TNHH NHA HANG</p>
                    <p className="text-sm text-blue-700">Số tiền: {depositAmount.toLocaleString()}đ</p>
                    <p className="text-sm text-blue-700">Nội dung: {userProfile?.phone || "SDT"} DAT BAN</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUserBanned}
                  />

                  {!depositProofPreview ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUserBanned}
                      className={`w-full p-8 border-2 border-dashed rounded-lg transition ${
                        isUserBanned
                          ? "opacity-50 cursor-not-allowed border-gray-300"
                          : "border-gray-300 hover:border-[#625EE8] hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="w-10 h-10 mb-3" />
                        <p className="font-medium">Nhấn để upload ảnh</p>
                        <p className="text-sm">PNG, JPG, GIF (tối đa 10MB)</p>
                      </div>
                    </button>
                  ) : (
                    <div className="relative">
                      <img
                        src={depositProofPreview}
                        alt="Deposit proof preview"
                        className="w-full max-h-64 object-contain rounded-lg border"
                      />
                      <button
                        onClick={handleRemoveImage}
                        disabled={isUserBanned}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <p className="text-sm text-green-600 mt-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Đã chọn ảnh: {depositProofImage?.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h4 className="mb-4">Tóm tắt đặt bàn</h4>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày giờ:</span>
                      <span>
                        {bookingData.date} {bookingData.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bàn số:</span>
                      <span>
                        {selectedTable?.table_number} -{" "}
                        {getFloorName(selectedTable?.location_id)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số người:</span>
                      <span>{bookingData.guests} người</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Tiền cọc:</span>
                      <span>{depositAmount.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setStep(3)} disabled={uploading}>
                  Quay lại
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={!paymentMethod || !depositProofImage || isUserBanned || uploading}
                >
                  {uploading ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
