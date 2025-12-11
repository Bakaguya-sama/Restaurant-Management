import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Utensils, WrenchIcon } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Modal } from '../../ui/Modal';
import { Input, Textarea } from '../../ui/Input';
import { Badge } from '../../ui/badge';
import { mockTables, mockBookings } from '../../../lib/mockData';
import { Table, TableStatus } from '../../../types';
import { toast } from 'sonner';

export function TablesMapPage() {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showBrokenModal, setShowBrokenModal] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [brokenReason, setBrokenReason] = useState('');

  const getTableColor = (status: TableStatus) => {
    switch (status) {
      case 'free':
        return 'bg-green-500 hover:bg-green-600';
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600';
      case 'reserved':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'dirty':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'broken':
        return 'bg-gray-500 cursor-not-allowed';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case 'free':
        return 'Trống';
      case 'occupied':
        return 'Có khách';
      case 'reserved':
        return 'Đã đặt';
      case 'dirty':
        return 'Chờ dọn';
      case 'broken':
        return 'Hỏng';
      default:
        return status;
    }
  };

  const handleTableClick = (table: Table) => {
    if (table.status === 'broken') {
      toast.error('Bàn đang hỏng, không thể sử dụng');
      return;
    }

    setSelectedTable(table);
    setShowActionModal(true);
  };

  const handleCreateOrder = () => {
    if (!selectedTable) return;

    if (selectedTable.status !== 'free') {
      toast.error('Bàn không ở trạng thái trống');
      return;
    }

    // Update table status to occupied
    setTables(
      tables.map((t) =>
        t.id === selectedTable.id ? { ...t, status: 'occupied' as TableStatus } : t
      )
    );

    toast.success(`Đã tạo order cho bàn ${selectedTable.number}`);
    setShowActionModal(false);
    setSelectedTable(null);
  };

  const handleCheckIn = () => {
    if (!selectedTable || !bookingCode) {
      toast.error('Vui lòng nhập mã đặt bàn');
      return;
    }

    // Find booking
    const booking = mockBookings.find((b) => b.id === bookingCode);
    if (!booking) {
      toast.error('Không tìm thấy mã đặt bàn');
      return;
    }

    // Update table status
    setTables(
      tables.map((t) =>
        t.id === selectedTable.id ? { ...t, status: 'occupied' as TableStatus } : t
      )
    );

    toast.success(`Đã check-in khách cho bàn ${selectedTable.number}`);
    setShowCheckInModal(false);
    setShowActionModal(false);
    setSelectedTable(null);
    setBookingCode('');
  };

  const handleCleanTable = () => {
    if (!selectedTable) return;

    if (selectedTable.status !== 'dirty') {
      toast.error('Bàn không ở trạng thái chờ dọn');
      return;
    }

    // Update table status to free
    setTables(
      tables.map((t) =>
        t.id === selectedTable.id ? { ...t, status: 'free' as TableStatus } : t
      )
    );

    toast.success(`Đã dọn xong bàn ${selectedTable.number}`);
    setShowActionModal(false);
    setSelectedTable(null);
  };

  const handleMarkBroken = () => {
    if (!selectedTable || !brokenReason) {
      toast.error('Vui lòng nhập lý do');
      return;
    }

    // Update table status to broken
    setTables(
      tables.map((t) =>
        t.id === selectedTable.id ? { ...t, status: 'broken' as TableStatus } : t
      )
    );

    toast.success(`Đã báo hỏng bàn ${selectedTable.number}`);
    setShowBrokenModal(false);
    setShowActionModal(false);
    setSelectedTable(null);
    setBrokenReason('');
  };

  // Group tables by area
  const tablesByArea = tables.reduce((acc, table) => {
    if (!acc[table.area]) {
      acc[table.area] = [];
    }
    acc[table.area].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  return (
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
              {tables.filter((t) => t.status === 'free').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 mb-1 text-sm">Có khách</p>
            <p className="text-2xl text-red-600">
              {tables.filter((t) => t.status === 'occupied').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 mb-1 text-sm">Đã đặt</p>
            <p className="text-2xl text-yellow-600">
              {tables.filter((t) => t.status === 'reserved').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 mb-1 text-sm">Chờ dọn</p>
            <p className="text-2xl text-orange-600">
              {tables.filter((t) => t.status === 'dirty').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 mb-1 text-sm">Hỏng</p>
            <p className="text-2xl text-gray-600">
              {tables.filter((t) => t.status === 'broken').length}
            </p>
          </Card>
        </div>
      </div>

      {/* Tables by Area */}
      {Object.entries(tablesByArea).map(([area, areaTables]) => (
        <div key={area} className="mb-8">
          <h3 className="mb-4">{area}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {areaTables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`relative p-6 rounded-lg text-white transition-all ${getTableColor(
                  table.status
                )}`}
                disabled={table.status === 'broken'}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{table.number}</div>
                  <div className="text-xs opacity-90">{table.seats} chỗ</div>
                  <div className="text-xs opacity-75 mt-1">
                    {getStatusText(table.status)}
                  </div>
                </div>
                {table.status === 'dirty' && (
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
        title={`Bàn ${selectedTable?.number}`}
      >
        {selectedTable && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Khu vực:</p>
                  <p>{selectedTable.area}</p>
                </div>
                <div>
                  <p className="text-gray-600">Số chỗ:</p>
                  <p>{selectedTable.seats}</p>
                </div>
                <div>
                  <p className="text-gray-600">Trạng thái:</p>
                  <Badge
                    className={
                      selectedTable.status === 'free'
                        ? 'bg-green-100 text-green-700'
                        : selectedTable.status === 'occupied'
                        ? 'bg-red-100 text-red-700'
                        : selectedTable.status === 'dirty'
                        ? 'bg-orange-100 text-orange-700'
                        : selectedTable.status === 'reserved'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {getStatusText(selectedTable.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {selectedTable.status === 'free' && (
                <>
                  <Button fullWidth onClick={handleCreateOrder}>
                    <Utensils className="w-4 h-4 mr-2" />
                    Tạo order mới
                  </Button>
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
              )}

              {selectedTable.status === 'dirty' && (
                <Button fullWidth onClick={handleCleanTable}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Xác nhận đã dọn xong
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
          setBookingCode('');
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
                setBookingCode('');
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
          setBrokenReason('');
        }}
        title="Báo hỏng bàn"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bàn: {selectedTable?.number}
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
                setBrokenReason('');
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
    </div>
  );
}