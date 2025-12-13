import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Filter, LayoutGrid, MapPin } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Select } from "../../ui/Input";
import { mockTables, mockLocations, mockFloors } from "../../../lib/mockData";
import { Table, TableStatus, Location, Floor } from "../../../types";
import { toast } from "sonner";
import {
  validateRequired,
  validateNumberRange,
  validateInteger,
} from "../../../lib/validation";
import { LocationManagement } from "./LocationManagement";

export function TablesPage() {
  const [activeTab, setActiveTab] = useState<"tables" | "locations">("tables");
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [filterArea, setFilterArea] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tables, setTables] = useState(mockTables);
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [floors, setFloors] = useState<Floor[]>(mockFloors);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    area: "",
    seats: 4,
    floor: "Floor 1",
  });

  // Update available areas when locations change
  const availableAreas = locations.map((loc) => loc.name);

  const handleRepair = (table: Table) => {
    setSelectedTable(table);
    setShowRepairModal(true);
  };

  const confirmRepair = () => {
    if (selectedTable) {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === selectedTable.id
            ? {
                ...table,
                status: "free" as TableStatus,
                brokenReason: undefined,
              }
            : table
        )
      );
      toast.success("Đã chuyển bàn về trạng thái trống");
      setShowRepairModal(false);
      setSelectedTable(null);
    }
  };

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
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // Prevent deletion if table is occupied or reserved
    if (table.status === "occupied" || table.status === "reserved") {
      toast.error(
        `Không thể xóa bàn ${table.number} vì bàn đang ${
          table.status === "occupied" ? "có khách" : "được đặt trước"
        }`
      );
      return;
    }

    if (confirm(`Bạn có chắc muốn xóa bàn ${table.number}?`)) {
      setTables(tables.filter((t) => t.id !== tableId));
      toast.success(`Đã xóa bàn ${table.number}`);
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    const numberValidation = validateRequired(formData.number, "Số bàn");
    const areaValidation = validateRequired(formData.area, "Khu vực");

    if (!numberValidation.isValid) {
      toast.error(numberValidation.error);
      return;
    }

    if (!areaValidation.isValid) {
      toast.error(areaValidation.error);
      return;
    }

    // Check if area exists in locations
    if (!availableAreas.includes(formData.area)) {
      toast.error("Vui lòng chọn vị trí hợp lệ");
      return;
    }

    // Validate seats count
    const seatsValidation = validateInteger(formData.seats, "Số ghế");
    if (!seatsValidation.isValid) {
      toast.error(seatsValidation.error);
      return;
    }

    const seatsRangeValidation = validateNumberRange(
      formData.seats,
      1,
      8,
      "Số ghế"
    );
    if (!seatsRangeValidation.isValid) {
      toast.error(seatsRangeValidation.error);
      return;
    }

    // Check duplicate table number (except when editing)
    const duplicateTable = tables.find(
      (t) => t.number === formData.number && t.id !== editingTable?.id
    );
    if (duplicateTable) {
      toast.error("Số bàn đã tồn tại");
      return;
    }

    if (editingTable) {
      // Update table
      setTables(
        tables.map((t) =>
          t.id === editingTable.id ? { ...t, ...formData } : t
        )
      );
      toast.success("Đã cập nhật bàn");
    } else {
      // Add new table
      const newTable: Table = {
        id: `T${Date.now()}`,
        ...formData,
        status: "free" as TableStatus,
      };
      setTables([...tables, newTable]);
      toast.success("Đã thêm bàn mới");
    }

    setShowModal(false);
    setEditingTable(null);
    setFormData({ number: "", area: "", seats: 4, floor: "Floor 1" });
  };

  const filteredTables = tables.filter((table) => {
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
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("tables")}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === "tables"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <LayoutGrid className="w-4 h-4 inline mr-2" />
          Quản lý bàn
        </button>
        <button
          onClick={() => setActiveTab("locations")}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === "locations"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Quản lý vị trí & tầng
        </button>
      </div>

      {/* Tables Tab */}
      {activeTab === "tables" && (
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
                  ...availableAreas.map((area) => ({
                    value: area,
                    label: area,
                  })),
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
                  {table.status === "broken" ? (
                    <Button
                      size="sm"
                      onClick={() => handleRepair(table)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Khắc phục
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(table)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                  )}
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
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === "locations" && (
        <LocationManagement
          locations={locations}
          floors={floors}
          tables={tables}
          onLocationsChange={(newLocations) => {
            setLocations(newLocations);
            // Reset filter if deleted location was selected
            if (
              filterArea !== "all" &&
              !newLocations.find((l) => l.name === filterArea)
            ) {
              setFilterArea("all");
            }
          }}
          onFloorsChange={setFloors}
        />
      )}

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
              ...availableAreas.map((area) => ({ value: area, label: area })),
            ]}
            required
          />
          <Input
            label="Số ghế"
            type="number"
            value={formData.seats}
            onChange={(e) =>
              setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })
            }
            min="1"
            max="8"
            step="1"
            required
          />
          <Select
            label="Tầng"
            value={formData.floor}
            onChange={(e) =>
              setFormData({ ...formData, floor: e.target.value })
            }
            options={floors.map((f) => ({ value: f.name, label: f.name }))}
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

      {/* Repair Modal */}
      <Modal
        isOpen={showRepairModal}
        onClose={() => {
          setShowRepairModal(false);
          setSelectedTable(null);
        }}
        title="Khắc phục sự cố bàn"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Bàn số:</p>
            <p className="font-medium text-lg">{selectedTable?.number}</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-700 mb-2">Lý do hỏng:</p>
            <p className="text-red-600">
              {selectedTable?.brokenReason || "Không có thông tin"}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRepairModal(false);
                setSelectedTable(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmRepair}
              className="bg-green-600 hover:bg-green-700"
            >
              Xác nhận khắc phục
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
