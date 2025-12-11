import React, { useState } from "react";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Select } from "../../ui/Input";
import { mockTables } from "../../../lib/mockData";
import { Table } from "../../../types";

export function TablesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [filterArea, setFilterArea] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    number: "",
    area: "",
    seats: 4,
    floor: "Floor 1",
  });

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      area: table.area,
      seats: table.seats,
      floor: table.floor || "Floor 1",
    });
    setShowModal(true);
  };

  const handleDelete = (tableId: string) => {
    if (confirm("Bạn có chắc muốn xóa bàn này?")) {
      alert(`Đã xóa bàn ${tableId}`);
    }
  };

  const handleSubmit = () => {
    alert(editingTable ? "Đã cập nhật bàn" : "Đã thêm bàn mới");
    setShowModal(false);
    setEditingTable(null);
    setFormData({ number: "", area: "", seats: 4, floor: "Floor 1" });
  };

  const filteredTables = mockTables.filter((table) => {
    const matchArea = filterArea === "all" || table.area === filterArea;
    const matchStatus = filterStatus === "all" || table.status === filterStatus;
    return matchArea && matchStatus;
  });

  const statusColors = {
    free: "bg-green-100 text-green-700",
    occupied: "bg-red-100 text-red-700",
    reserved: "bg-yellow-100 text-yellow-700",
    dirty: "bg-orange-100 text-orange-700",
    broken: "bg-gray-100 text-gray-700",
  };

  const statusLabels = {
    free: "Trống",
    occupied: "Có khách",
    reserved: "Đã đặt",
    dirty: "Chờ dọn",
    broken: "Hỏng",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>Quản lý bàn</h2>
          <p className="text-gray-600 mt-1">
            Quản lý và theo dõi trạng thái bàn ăn
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm bàn
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <Select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            options={[
              { value: "all", label: "Tất cả khu vực" },
              { value: "Main Hall", label: "Main Hall" },
              { value: "VIP", label: "VIP" },
              { value: "Outdoor", label: "Outdoor" },
            ]}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "free", label: "Trống" },
              { value: "occupied", label: "Có khách" },
              { value: "reserved", label: "Đã đặt" },
              { value: "dirty", label: "Chờ dọn" },
              { value: "broken", label: "Hỏng" },
            ]}
          />
        </div>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((table) => (
          <Card key={table.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="mb-1">{table.number}</h4>
                <p className="text-sm text-gray-600">{table.area}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  statusColors[table.status]
                }`}
              >
                {statusLabels[table.status]}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
              <span>{table.seats} chỗ</span>
              <span>{table.floor}</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(table)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Sửa
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(table.id)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTable(null);
          setFormData({ number: "", area: "", seats: 4, floor: "Floor 1" });
        }}
        title={editingTable ? "Chỉnh sửa bàn" : "Thêm bàn mới"}
      >
        <div className="space-y-4">
          <Input
            label="Số bàn"
            value={formData.number}
            onChange={(e) =>
              setFormData({ ...formData, number: e.target.value })
            }
            placeholder="VD: T01"
            required
          />
          <Select
            label="Khu vực"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            options={[
              { value: "", label: "Chọn khu vực" },
              { value: "Main Hall", label: "Main Hall" },
              { value: "VIP", label: "VIP" },
              { value: "Outdoor", label: "Outdoor" },
            ]}
            required
          />
          <Input
            label="Số ghế"
            type="number"
            value={formData.seats}
            onChange={(e) =>
              setFormData({ ...formData, seats: parseInt(e.target.value) })
            }
            min="1"
            required
          />
          <Select
            label="Tầng"
            value={formData.floor}
            onChange={(e) =>
              setFormData({ ...formData, floor: e.target.value })
            }
            options={[
              { value: "Floor 1", label: "Tầng 1" },
              { value: "Floor 2", label: "Tầng 2" },
            ]}
          />

          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowModal(false);
                setEditingTable(null);
              }}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleSubmit}>
              {editingTable ? "Cập nhật" : "Thêm bàn"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
