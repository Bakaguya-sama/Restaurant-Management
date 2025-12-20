import React, { useState } from "react";
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
import { mockBookings } from "../../../lib/mockData";
import { Table, TableStatus, Customer } from "../../../types";
import { toast } from "sonner";
import { useTables } from "../../../hooks/useTables";
import { useLocations } from "../../../hooks/useLocations";

export function TablesMapPage() {
  const hookResult = useTables();
  console.log('useTables hook result:', hookResult);
  console.log('updateTableStatus type:', typeof hookResult.updateTableStatus);
  const { tables, loading, error, setTables, updateTableStatus } = hookResult;
  const { locations } = useLocations();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showBrokenModal, setShowBrokenModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [brokenReason, setBrokenReason] = useState("");

  // Customer info states
  const [customerType, setCustomerType] = useState<"member" | "walk-in">(
    "member"
  );
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
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
    if (!customerPhone || customerPhone.length < 10) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    setIsSearching(true);

    // TODO: Replace with actual API call
    // Simulate API call
    setTimeout(() => {
      // Mock customer data - replace with actual API call
      const mockCustomer: Customer = {
        id: "C001",
        name: "Nguyễn Văn A",
        phone: customerPhone,
        role: "customer",
        membershipTier: "gold",
        points: 1250,
        violations: [],
        isBlacklisted: false,
      };

      // Check if customer exists
      if (customerPhone === "0123456789") {
        setFoundCustomer(mockCustomer);
        setCustomerName(mockCustomer.name);
        toast.success("Tìm thấy thông tin khách hàng");
      } else {
        setFoundCustomer(null);
        toast.error("Không tìm thấy khách hàng. Vui lòng chọn khách vãng lai.");
      }

      setIsSearching(false);
    }, 500);
  };

  const handleCreateOrder = () => {
    if (!selectedTable) return;

    if (selectedTable.status !== "free") {
      toast.error("Bàn không ở trạng thái trống");
      return;
    }

    // Show customer info modal first
    setShowActionModal(false);
    setShowCustomerModal(true);
  };

  const handleConfirmCustomerAndCreateOrder = async () => {
    if (!selectedTable) return;

    // Validate customer info
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

    // Update table status to occupied via API
    try {
      await updateTableStatus(selectedTable.id, "occupied");

      const customerInfo =
        customerType === "member"
          ? `${
              foundCustomer?.name
            } (Thành viên ${foundCustomer?.membershipTier?.toUpperCase()})`
          : customerName;

      toast.success(
        `Đã tạo order cho bàn ${selectedTable.table_number} - Khách: ${customerInfo}`
      );
    } catch (err) {
      console.error("Error creating order:", err);
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    // Reset states
    setShowCustomerModal(false);
    setSelectedTable(null);
    setCustomerType("member");
    setCustomerPhone("");
    setCustomerName("");
    setFoundCustomer(null);

    // TODO: Navigate to OrderingPage with customer info and table
  };

  const handleCheckIn = async () => {
    if (!selectedTable || !bookingCode) {
      toast.error("Vui lòng nhập mã đặt bàn");
      return;
    }

    // Find booking
    const booking = mockBookings.find((b) => b.id === bookingCode);
    if (!booking) {
      toast.error("Không tìm thấy mã đặt bàn");
      return;
    }

    // Update table status via API
    try {
      await updateTableStatus(selectedTable.id, "occupied");
      toast.success(`Đã check-in khách cho bàn ${selectedTable.table_number}`);
    } catch (err) {
      console.error("Error checking in:", err);
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    setShowCheckInModal(false);
    setShowActionModal(false);
    setSelectedTable(null);
    setBookingCode("");

    //TODO: Call api cập nhật phiếu đặt bàn của khách
  };

  const handleCleanTable = async () => {
    if (!selectedTable) return;

    if (selectedTable.status !== "dirty") {
      toast.error("Bàn không ở trạng thái chờ dọn");
      return;
    }

    // Update table status via API
    try {
      await updateTableStatus(selectedTable.id, "free");
      toast.success(`Đã dọn xong bàn ${selectedTable.table_number}`);
    } catch (err) {
      console.error("Error cleaning table:", err);
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
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

    // Update table status via API
    try {
      await updateTableStatus(selectedTable.id, "dirty");
      toast.success(`Đã giải phóng bàn ${selectedTable.table_number}`);
    } catch (err) {
      console.error("Error checking out table:", err);
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    setShowActionModal(false);
    setSelectedTable(null);

    //TODO: Call api để cập nhật trạng thái bàn, hóa đơn của khách
  };

  const handleMarkBroken = async () => {
    if (!selectedTable || !brokenReason) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    // Update table status via API
    try {
      await updateTableStatus(selectedTable.id, "broken", brokenReason);
      toast.success(`Đã báo hỏng bàn ${selectedTable.table_number}`);
    } catch (err) {
      console.error("Error marking table as broken:", err);
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật trạng thái bàn";
      toast.error(`Lỗi: ${errorMsg}`);
      return;
    }

    setShowBrokenModal(false);
    setShowActionModal(false);
    setSelectedTable(null);
    setBrokenReason("");
  };

  // Group tables by area
  const tablesByArea = tables.reduce((acc, table) => {
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
              {tables.filter((t) => t.status === "free").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 mb-1 text-sm">Có khách</p>
            <p className="text-2xl text-red-600">
              {tables.filter((t) => t.status === "occupied").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 mb-1 text-sm">Đã đặt</p>
            <p className="text-2xl text-yellow-600">
              {tables.filter((t) => t.status === "reserved").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 mb-1 text-sm">Chờ dọn</p>
            <p className="text-2xl text-orange-600">
              {tables.filter((t) => t.status === "dirty").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 mb-1 text-sm">Hỏng</p>
            <p className="text-2xl text-gray-600">
              {tables.filter((t) => t.status === "broken").length}
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
                  <div className="text-xs opacity-90">{table.capacity} chỗ</div>
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
          <p className="text-gray-600">Bàn: {selectedTable?.table_number}</p>

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
                  disabled={isSearching}
                  className="mt-7"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {foundCustomer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-green-900">
                        {foundCustomer.name}
                      </p>
                      <p className="text-sm text-green-700">
                        {foundCustomer.phone}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {foundCustomer.membershipTier.toUpperCase()}
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
