import { useState } from "react";
import { Plus, Edit, Trash2, Filter, LayoutGrid, MapPin } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Select } from "../../ui/Input";
import { Table, TableStatus } from "../../../types";
import { toast } from "sonner";
import {
  validateRequired,
  validateNumberRange,
  validateInteger,
} from "../../../lib/validation";
import { LocationManagement } from "./LocationManagement";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { useTables } from "../../../hooks/useTables";
import { useLocations } from "../../../hooks/useLocations";
import { useFloors } from "../../../hooks/useFloors";

export function TablesPage() {
  const [activeTab, setActiveTab] = useState<"tables" | "locations">("tables");
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [filterArea, setFilterArea] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    table_number: "",
    location_id: "",
    capacity: 4,
    floor: "Floor 1",
    createdAt: "",
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmCancelText, setConfirmCancelText] = useState("Hủy");
  const [confirmVariant, setConfirmVariant] = useState<
    "info" | "warning" | "danger"
  >("info");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // API hooks
  const {
    tables: apiTables,
    loading: tablesLoading,
    error: tablesError,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable,
  } = useTables();

  const {
    locations: apiLocations,
  } = useLocations();

  const {
    floors: apiFloors,
  } = useFloors();

  
  const getLocationName = (locationId: string) => {
    return apiLocations.find((loc) => loc.id === locationId)?.name || "";
  };

 
  const getFloorNameFromLocation = (locationId: string) => {
    const location = apiLocations.find((loc) => loc.id === locationId);
    if (!location) return "";
    const floor = apiFloors.find((f) => f.id === location.floor_id);
    return floor?.floor_name || "";
  };

  const handleRepair = (table: Table) => {
    setSelectedTable(table);
    setShowRepairModal(true);
  };

  const confirmRepair = () => {
    if (selectedTable) {
      updateTableStatus(selectedTable.id, "free")
        .then(() => {
          toast.success("Đã chuyển bàn về trạng thái trống");
          setShowRepairModal(false);
          setSelectedTable(null);
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : "Lỗi khi cập nhật bàn");
        });
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number,
      location_id: table.location_id,
      capacity: table.capacity,
      floor: getFloorNameFromLocation(table.location_id),
      createdAt: table.createdAt || "",
    });
    setShowModal(true);
  };

  const handleDelete = (tableId: string) => {
    const table = apiTables.find((t) => t.id === tableId);
    if (!table) return;

    // Prevent deletion if table is occupied or reserved
    if (table.status === "occupied" || table.status === "reserved") {
      toast.error(
        `Không thể xóa bàn ${table.table_number} vì bàn đang ${
          table.status === "occupied" ? "có khách" : "được đặt trước"
        }`
      );
      return;
    }

    setConfirmTitle(`Xóa bàn`);
    setConfirmMessage(`Bạn có chắc muốn xóa bàn này?`);
    setConfirmText("Xóa");
    setConfirmCancelText("Hủy");
    setConfirmVariant(`warning`);
    setPendingAction(() => async () => {
      try {
        await deleteTable(tableId);
        toast.success(`Đã xóa bàn ${table.table_number}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi khi xóa bàn");
      }
    });
    setShowConfirmModal(true);
  };

  const handleSubmit = async () => {
    // Validate required fields
    const numberValidation = validateRequired(formData.table_number, "Số bàn");
    const locationValidation = validateRequired(formData.location_id, "Khu vực");

    if (!numberValidation.isValid) {
      toast.error(numberValidation.error);
      return;
    }

    if (!locationValidation.isValid) {
      toast.error(locationValidation.error);
      return;
    }

    // Validate capacity count
    const capacityValidation = validateInteger(formData.capacity, "Số chỗ");
    if (!capacityValidation.isValid) {
      toast.error(capacityValidation.error);
      return;
    }

    const capacityRangeValidation = validateNumberRange(
      formData.capacity,
      1,
      8,
      "Số chỗ"
    );
    if (!capacityRangeValidation.isValid) {
      toast.error(capacityRangeValidation.error);
      return;
    }

    // Check duplicate table number (except when editing)
    const duplicateTable = apiTables.find(
      (t) => t.table_number === formData.table_number && t.id !== editingTable?.id
    );
    if (duplicateTable) {
      toast.error("Số bàn đã tồn tại");
      return;
    }

    try {
      // Auto-set floor from selected location
      const selectedFloor = getFloorNameFromLocation(formData.location_id);
      const dataToSubmit = {
        ...formData,
        floor: selectedFloor,
      };

      if (editingTable) {
        // Update table via API
        await updateTable(editingTable.id, dataToSubmit);
        toast.success("Đã cập nhật bàn");
      } else {
        // Create new table via API
        await createTable({
          ...dataToSubmit,
          status: "free" as TableStatus,
        });
        toast.success("Đã thêm bàn mới");
      }

      setShowModal(false);
      setEditingTable(null);
      setFormData({ table_number: "", location_id: "", capacity: 4, floor: "Floor 1", createdAt: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi lưu bàn");
    }
  };

  const filteredTables = apiTables.filter((table) => {
    const locationName = getLocationName(table.location_id);
    const matchArea = filterArea === "all" || locationName === filterArea;
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
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        onConfirm={() => {
          if (pendingAction) {
            pendingAction();
          }
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText={confirmCancelText}
        variant={confirmVariant}
      />

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
                  ...apiLocations.map((loc) => ({
                    value: loc.name,
                    label: loc.name,
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
          {tablesError && (
            <Card className="p-4 mb-6 border-red-200 bg-red-50">
              <p className="text-red-700">Lỗi tải bàn: {tablesError}</p>
            </Card>
          )}

          {tablesLoading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Đang tải danh sách bàn...</p>
            </Card>
          ) : apiTables.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Chưa có bàn nào. Hãy thêm bàn mới.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTables.map((table) => (
                <Card key={table.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="mb-1">{table.table_number}</h4>
                    <p className="text-sm text-gray-600">{getLocationName(table.location_id)}</p>
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
                  <span>{table.capacity} chỗ</span>
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
          )}
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === "locations" && (
        <LocationManagement
          locations={apiLocations}
          floors={apiFloors}
          tables={apiTables}
          onLocationsChange={(newLocations) => {
            
            if (
              filterArea !== "all" &&
              !newLocations.find((l) => l.name === filterArea)
            ) {
              setFilterArea("all");
            }
          }}
          onFloorsChange={() => {
            
          }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTable(null);
          setFormData({ table_number: "", location_id: "", capacity: 4, floor: "Floor 1", createdAt: "" });
        }}
        title={editingTable ? "Chỉnh sửa bàn" : "Thêm bàn mới"}
      >
        <div className="space-y-4">
          <Input
            label="Số bàn"
            value={formData.table_number}
            onChange={(e) =>
              setFormData({ ...formData, table_number: e.target.value })
            }
            placeholder="VD: T01"
            required
          />
          <Select
            label="Khu vực"
            value={formData.location_id}
            onChange={(e) => {
              const newLocationId = e.target.value;
              const newFloor = getFloorNameFromLocation(newLocationId);
              setFormData({ 
                ...formData, 
                location_id: newLocationId,
                floor: newFloor,
              });
            }}
            options={[
              { value: "", label: "Chọn khu vực" },
              ...apiLocations.map((loc) => ({ value: loc.id, label: loc.name })),
            ]}
            required
          />
          <Input
            label="Số chỗ"
            type="number"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
            }
            min="1"
            max="8"
            step="1"
            required
          />
          <div className="p-3 bg-gray-100 rounded-md border border-gray-300">
            <p className="text-sm text-gray-600 mb-1">Tầng</p>
            <p className="font-medium text-gray-800">
              {formData.floor || "(Được chọn tự động từ khu vực)"}
            </p>
          </div>

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
            <p className="font-medium text-lg">{selectedTable?.table_number}</p>
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
