import React, { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
  CheckCircle,
  Utensils,
  WrenchIcon,
  User,
  UserCheck,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Textarea } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import { Table, TableStatus, Customer } from "../../../types";
import { toast } from "sonner";
import { useTables } from "../../../hooks/useTables";
import { useLocations } from "../../../hooks/useLocations";
import { useCustomers } from "../../../hooks/useCustomers";
import { useStaff } from "../../../hooks/useStaff";
import { useReservations } from "../../../hooks/useReservations";
import { authService } from "../../../lib/authService";
import { createOrder } from "../../../lib/orderingPageApi";

export function TablesMapPage() {
  const hookResult = useTables();
  console.log("useTables hook result:", hookResult);
  console.log("updateTableStatus type:", typeof hookResult.updateTableStatus);
  const { tables, loading, error, setTables, updateTableStatus } = hookResult;
  const { locations } = useLocations();
  const {
    customers,
    loading: customersLoading,
    error: customersError,
    fetchCustomers,
  } = useCustomers();
  const {
    staff,
    loading: staffLoading,
    error: staffError,
    fetchStaff,
  } = useStaff();
  const { updateReservationStatus, fetchReservations } = useReservations();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showBrokenModal, setShowBrokenModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [brokenReason, setBrokenReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [customerType, setCustomerType] = useState<"member" | "walk-in">(
    "member"
  );
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const firstWaiter = staff.find((s) => s.role === "waiter");

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        const userId = response.data.id || response.data._id;
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const getLocationName = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId);
    return location?.name || locationId;
  };

  const getTableColor = (status: TableStatus) => {
    switch (status) {
      case "free":
        return "bg-green-500 hover:bg-green-600";
      case "occupied":
        return "bg-red-500 hover:bg-red-600";
      case "reserved":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "dirty":
        return "bg-orange-500 hover:bg-orange-600";
      case "broken":
        return "bg-gray-500 cursor-not-allowed";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case "free":
        return "Trống";
      case "occupied":
        return "Có khách";
      case "reserved":
        return "Đã đặt";
      case "dirty":
        return "Chờ dọn";
      case "broken":
        return "Hỏng";
      default:
        return status;
    }
  };

  const handleTableClick = (table: Table) => {
    if (table.status === "broken") {
      toast.error("Bàn đang hỏng, không thể sử dụng");
      return;
    }

    setSelectedTable(table);
    setShowActionModal(true);
  };

  const handleSearchCustomer = async () => {
    const phoneInput = customerPhone.trim();

    if (!phoneInput || phoneInput.length < 10) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ (ít nhất 10 chữ số)");
      return;
    }

    setIsSearching(true);

    try {
      if (!customers || customers.length === 0) {
        console.log("Fetching customers...");
        await fetchCustomers();
      }

      console.log(
        "Available customers:",
        customers.map((c) => ({ id: c.id, phone: c.phone, name: c.full_name }))
      );
      console.log("Searching for phone:", phoneInput);

      let customer = customers.find((c) => c.phone.trim() === phoneInput) as
        | Customer
        | undefined;

      if (!customer) {
        customer = customers.find(
          (c) => c.phone.includes(phoneInput) || phoneInput.includes(c.phone)
        ) as Customer | undefined;
      }

      if (customer) {
        setFoundCustomer(customer as Customer);
        setCustomerName(customer.full_name);
        toast.success(`Tìm thấy: ${customer.full_name}`);
      } else {
        setFoundCustomer(null);
        toast.error("Không tìm thấy khách hàng với số điện thoại này");
      }
    } catch (err) {
      console.error("Error searching customer:", err);
      toast.error("Lỗi khi tìm kiếm khách hàng");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateOrder = () => {
    if (!selectedTable) return;

    if (selectedTable.status !== "free") {
      toast.error("Bàn không ở trạng thái trống");
      return;
    }

    setShowActionModal(false);
    setShowCustomerModal(true);
  };

  const handleConfirmCustomerAndCreateOrder = async () => {
    if (!selectedTable) return;

    if (customerType === "member") {
      if (!foundCustomer) {
        toast.error("Vui lòng tìm kiếm thông tin khách hàng thành viên");
        return;
      }
    } else {
      if (!customerName.trim()) {
        toast.error("Vui lòng nhập tên khách hàng");
        return;
      }
    }

    if (!currentUserId) {
      toast.error("Không thể xác định thông tin nhân viên. Vui lòng thử lại sau.");
      return;
    }

    try {
      const orderData = {
        order_number: `ORD-${Date.now()}`,
        order_type: "dine-in-waiter" as const,
        order_time: new Date().toISOString(),
        table_id: selectedTable.id,
        customer_id: customerType === "member" ? foundCustomer?.id : undefined,
        staff_id: currentUserId,
        status: "pending" as const,
      };

      const createdOrder = await createOrder(orderData);
      console.log("Order created:", createdOrder);

      await updateTableStatus(selectedTable.id, "occupied");

      const customerInfo =
        customerType === "member"
          ? `${
              foundCustomer?.full_name
            } (Thành viên ${foundCustomer?.membership_level?.toUpperCase()})`
          : customerName;

      toast.success(
        `Đã tạo order cho bàn ${selectedTable.table_number} - Khách: ${customerInfo}`
      );
    } catch (err) {
      console.error("Error creating order:", err);
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi tạo order";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    setShowCustomerModal(false);
    setSelectedTable(null);
    setCustomerType("member");
    setCustomerPhone("");
    setCustomerName("");
    setFoundCustomer(null);
  };

  const handleCheckIn = async () => {
    if (!selectedTable || !bookingCode) {
      toast.error("Vui lòng nhập mã đặt bàn");
      return;
    }

    try {
      await updateTableStatus(selectedTable.id, "occupied");
      
      // Use bookingCode as reservation ID
      const reservationId = bookingCode.trim();
      
      try {
        await updateReservationStatus(reservationId, "completed");
      } catch (err) {
        console.error("Error updating reservation status:", err);
      }
      
      toast.success(`Đã check-in khách cho bàn ${selectedTable.table_number}`);
    } catch (err) {
      console.error("Error checking in:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    setShowCheckInModal(false);
    setShowActionModal(false);
    setSelectedTable(null);
    setBookingCode("");
  };

  const handleCleanTable = async () => {
    if (!selectedTable) return;

    if (selectedTable.status !== "dirty") {
      toast.error("Bàn không ở trạng thái chờ dọn");
      return;
    }

    try {
      await updateTableStatus(selectedTable.id, "free");
      toast.success(`Đã dọn xong bàn ${selectedTable.table_number}`);
    } catch (err) {
      console.error("Error cleaning table:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    setShowActionModal(false);
    setSelectedTable(null);
  };

  const handleTableCheckout = async () => {
    if (!selectedTable) return;

    if (selectedTable.status !== "occupied") {
      toast.error("Bàn chưa được sử dụng xong");
      return;
    }

    try {
      await updateTableStatus(selectedTable.id, "dirty");
      toast.success(`Đã giải phóng bàn ${selectedTable.table_number}`);
    } catch (err) {
      console.error("Error checking out table:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    setShowActionModal(false);
    setSelectedTable(null);
  };

  const handleMarkBroken = async () => {
    if (!selectedTable || !brokenReason) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    if (!currentUserId) {
      toast.error("Không thể xác định thông tin nhân viên. Vui lòng thử lại sau.");
      return;
    }

    try {
      await updateTableStatus(selectedTable.id, "broken", brokenReason, currentUserId);
      toast.success(`Đã báo hỏng bàn ${selectedTable.table_number}`);
    } catch (err) {
      console.error("Error marking table as broken:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    setShowBrokenModal(false);
    setShowActionModal(false);
    setSelectedTable(null);
    setBrokenReason("");
  };

  // Filter tables based on search query
  const filteredTables = tables.filter((table) =>
    table.table_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tablesByArea = filteredTables.reduce((acc, table) => {
    if (!acc[table.location_id]) {
      acc[table.location_id] = [];
    }
    acc[table.location_id].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  return (
    <div>
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Lỗi: {error}</p>
        </div>
      )}

      {!loading && tables.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">Không có bàn nào</p>
        </div>
      )}

      {!loading && tables.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="mb-4">Sơ đồ bàn</h2>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm bàn (Bàn A1, A2, ...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Tìm thấy {filteredTables.length} bàn
                </p>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Có khách</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Đã đặt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">Chờ dọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-sm">Hỏng</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-gray-600 mb-1 text-sm">Trống</p>
                <p className="text-2xl text-green-600">
                  {filteredTables.filter((t) => t.status === "free").length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-gray-600 mb-1 text-sm">Có khách</p>
                <p className="text-2xl text-red-600">
                  {filteredTables.filter((t) => t.status === "occupied").length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-gray-600 mb-1 text-sm">Đã đặt</p>
                <p className="text-2xl text-yellow-600">
                  {filteredTables.filter((t) => t.status === "reserved").length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-gray-600 mb-1 text-sm">Chờ dọn</p>
                <p className="text-2xl text-orange-600">
                  {filteredTables.filter((t) => t.status === "dirty").length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-gray-600 mb-1 text-sm">Hỏng</p>
                <p className="text-2xl text-gray-600">
                  {filteredTables.filter((t) => t.status === "broken").length}
                </p>
              </Card>
            </div>
          </div>

          {/* Tables by Area */}
          {Object.entries(tablesByArea).map(([locationId, areaTables]) => (
            <div key={locationId} className="mb-8">
              <h3 className="mb-4">{getLocationName(locationId)}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {areaTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`relative p-6 rounded-lg text-white transition-all ${getTableColor(
                      table.status
                    )}`}
                    disabled={table.status === "broken"}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{table.table_number}</div>
                      <div className="text-xs opacity-90">
                        {table.capacity} chỗ
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {getStatusText(table.status)}
                      </div>
                    </div>
                    {table.status === "dirty" && (
                      <div className="absolute top-1 right-1">
                        <AlertCircle className="w-5 h-5 animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Table Action Modal */}
          <Modal
            isOpen={showActionModal}
            onClose={() => {
              setShowActionModal(false);
              setSelectedTable(null);
            }}
            title={`Bàn ${selectedTable?.table_number}`}
          >
            {selectedTable && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Khu vực:</p>
                      <p>{getLocationName(selectedTable.location_id)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Số chỗ:</p>
                      <p>{selectedTable.capacity}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Trạng thái:</p>
                      <Badge
                        className={
                          selectedTable.status === "free"
                            ? "bg-green-100 text-green-700"
                            : selectedTable.status === "occupied"
                            ? "bg-red-100 text-red-700"
                            : selectedTable.status === "dirty"
                            ? "bg-orange-100 text-orange-700"
                            : selectedTable.status === "reserved"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {getStatusText(selectedTable.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedTable.status === "free" ? (
                    <>
                      <Button fullWidth onClick={handleCreateOrder}>
                        <Utensils className="w-4 h-4 mr-2" />
                        Tạo order mới
                      </Button>
                    </>
                  ) : selectedTable.status === "reserved" ? (
                    <>
                      <Button
                        fullWidth
                        variant="secondary"
                        onClick={() => {
                          setShowActionModal(false);
                          setShowCheckInModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Check-in khách đặt
                      </Button>
                    </>
                  ) : (
                    ""
                  )}

                  {selectedTable.status === "dirty" && (
                    <Button fullWidth onClick={handleCleanTable}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Xác nhận đã dọn xong
                    </Button>
                  )}

                  {selectedTable.status === "occupied" && (
                    <Button fullWidth onClick={handleTableCheckout}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Xác nhận khách trả bàn
                    </Button>
                  )}

                  {selectedTable.status !== "occupied" && (
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={() => {
                        setShowActionModal(false);
                        setShowBrokenModal(true);
                      }}
                    >
                      <WrenchIcon className="w-4 h-4 mr-2" />
                      Báo hỏng
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Modal>

          {/* Check-in Modal */}
          <Modal
            isOpen={showCheckInModal}
            onClose={() => {
              setShowCheckInModal(false);
              setBookingCode("");
            }}
            title="Check-in khách đặt bàn"
          >
            <div className="space-y-4">
              <Input
                label="Mã đặt bàn"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="Nhập mã đặt bàn (VD: B001)"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Gợi ý: Quét mã QR trên phiếu đặt bàn hoặc nhập mã thủ công
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowCheckInModal(false);
                    setBookingCode("");
                  }}
                >
                  Hủy
                </Button>
                <Button fullWidth onClick={handleCheckIn}>
                  Xác nhận check-in
                </Button>
              </div>
            </div>
          </Modal>

          {/* Broken Table Modal */}
          <Modal
            isOpen={showBrokenModal}
            onClose={() => {
              setShowBrokenModal(false);
              setBrokenReason("");
            }}
            title="Báo hỏng bàn"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Bàn: {selectedTable?.table_number}
              </p>

              <Textarea
                label="Lý do hỏng"
                value={brokenReason}
                onChange={(e) => setBrokenReason(e.target.value)}
                placeholder="VD: Ghế bị gãy, bàn lung lay..."
                rows={4}
              />

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowBrokenModal(false);
                    setBrokenReason("");
                  }}
                >
                  Hủy
                </Button>
                <Button fullWidth onClick={handleMarkBroken}>
                  Xác nhận báo hỏng
                </Button>
              </div>
            </div>
          </Modal>

          {/* Customer Info Modal */}
          <Modal
            isOpen={showCustomerModal}
            onClose={() => {
              setShowCustomerModal(false);
              setCustomerType("member");
              setCustomerPhone("");
              setCustomerName("");
              setFoundCustomer(null);
            }}
            title="Xác nhận thông tin khách hàng"
          >
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Bàn: <strong>{selectedTable?.table_number}</strong> -{" "}
                  {getLocationName(selectedTable?.location_id || "")}
                </p>
              </div>

              {/* Customer Type Selection */}
              <div className="flex gap-2">
                <Button
                  fullWidth
                  variant={customerType === "member" ? "primary" : "secondary"}
                  onClick={() => {
                    setCustomerType("member");
                    setCustomerName("");
                  }}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Khách thành viên
                </Button>
                <Button
                  fullWidth
                  variant={customerType === "walk-in" ? "primary" : "secondary"}
                  onClick={() => {
                    setCustomerType("walk-in");
                    setCustomerPhone("");
                    setFoundCustomer(null);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Khách vãng lai
                </Button>
              </div>

              {/* Member Customer Section */}
              {customerType === "member" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      label="Số điện thoại"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setFoundCustomer(null);
                      }}
                      placeholder="Nhập số điện thoại khách hàng"
                      type="tel"
                    />
                    <Button
                      onClick={handleSearchCustomer}
                      disabled={isSearching || customersLoading}
                      className="mt-7"
                    >
                      {isSearching ? (
                        <span className="animate-spin">⟳</span>
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {customersLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        Đang tải danh sách khách hàng...
                      </p>
                    </div>
                  )}

                  {customersError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">
                        Lỗi: {customersError}
                      </p>
                    </div>
                  )}

                  {foundCustomer && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-green-900">
                            {foundCustomer.full_name}
                          </p>
                          <p className="text-sm text-green-700">
                            {foundCustomer.phone}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {foundCustomer.membership_level.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-green-700">
                        Điểm tích lũy: <strong>{foundCustomer.points}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Walk-in Customer Section */}
              {customerType === "walk-in" && (
                <div className="space-y-4">
                  <Input
                    label="Tên khách hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập tên khách hàng"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowCustomerModal(false);
                    setShowActionModal(true);
                    setCustomerType("member");
                    setCustomerPhone("");
                    setCustomerName("");
                    setFoundCustomer(null);
                  }}
                >
                  Quay lại
                </Button>
                <Button fullWidth onClick={handleConfirmCustomerAndCreateOrder}>
                  Xác nhận và tạo order
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
