import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Textarea, Select } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import { Location, Floor, Table } from "../../../types";
import { toast } from "sonner";
import { validateRequired } from "../../../lib/validation";

interface LocationManagementProps {
  locations: Location[];
  floors: Floor[];
  tables: Table[];
  onLocationsChange: (locations: Location[]) => void;
  onFloorsChange: (floors: Floor[]) => void;
}

export function LocationManagement({
  locations,
  floors,
  tables,
  onLocationsChange,
  onFloorsChange,
}: LocationManagementProps) {
  const [activeTab, setActiveTab] = useState<"locations" | "floors">(
    "locations"
  );

  // Location states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationFormData, setLocationFormData] = useState({
    name: "",
    floor: "",
    description: "",
  });

  // Floor states
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [floorFormData, setFloorFormData] = useState({
    name: "",
    level: 1,
    description: "",
  });

  // Location Management Functions
  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationFormData({
      name: "",
      floor: floors[0]?.name || "",
      description: "",
    });
    setShowLocationModal(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setLocationFormData({
      name: location.name,
      floor: location.floor,
      description: location.description || "",
    });
    setShowLocationModal(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId);
    if (!location) return;

    // Check if location has tables
    const tablesInLocation = tables.filter((t) => t.area === location.name);

    if (tablesInLocation.length > 0) {
      toast.error(
        `Không thể xóa vị trí "${location.name}" vì còn ${tablesInLocation.length} bàn đang sử dụng vị trí này`,
        { duration: 4000 }
      );
      return;
    }

    if (confirm(`Bạn có chắc muốn xóa vị trí "${location.name}"?`)) {
      const updatedLocations = locations.filter((l) => l.id !== locationId);
      onLocationsChange(updatedLocations);
      toast.success("Đã xóa vị trí");
    }
  };

  const handleSubmitLocation = () => {
    // Validate
    const nameValidation = validateRequired(
      locationFormData.name,
      "Tên vị trí"
    );
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    const floorValidation = validateRequired(locationFormData.floor, "Tầng");
    if (!floorValidation.isValid) {
      toast.error(floorValidation.error);
      return;
    }

    // Check duplicate name (except when editing)
    const duplicateName = locations.find(
      (l) => l.name === locationFormData.name && l.id !== editingLocation?.id
    );
    if (duplicateName) {
      toast.error("Tên vị trí đã tồn tại");
      return;
    }

    if (editingLocation) {
      // Update location
      const updatedLocations = locations.map((l) =>
        l.id === editingLocation.id
          ? {
              ...l,
              name: locationFormData.name,
              floor: locationFormData.floor,
              description: locationFormData.description,
            }
          : l
      );
      onLocationsChange(updatedLocations);
      toast.success("Đã cập nhật vị trí");
    } else {
      // Add new location
      const newLocation: Location = {
        id: `L${Date.now()}`,
        name: locationFormData.name,
        floor: locationFormData.floor,
        description: locationFormData.description,
        createdAt: new Date().toISOString(),
      };
      onLocationsChange([...locations, newLocation]);
      toast.success("Đã thêm vị trí mới");
    }

    setShowLocationModal(false);
    setEditingLocation(null);
  };

  // Floor Management Functions
  const handleAddFloor = () => {
    setEditingFloor(null);
    const nextLevel = Math.max(...floors.map((f) => f.level), 0) + 1;
    setFloorFormData({
      name: `Floor ${nextLevel}`,
      level: nextLevel,
      description: "",
    });
    setShowFloorModal(true);
  };

  const handleEditFloor = (floor: Floor) => {
    setEditingFloor(floor);
    setFloorFormData({
      name: floor.name,
      level: floor.level,
      description: floor.description || "",
    });
    setShowFloorModal(true);
  };

  const handleDeleteFloor = (floorId: string) => {
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return;

    // Check if floor has locations
    const locationsOnFloor = locations.filter((l) => l.floor === floor.name);

    if (locationsOnFloor.length > 0) {
      toast.error(
        `Không thể xóa tầng "${floor.name}" vì còn ${locationsOnFloor.length} vị trí đang thuộc tầng này`,
        { duration: 4000 }
      );
      return;
    }

    if (floors.length <= 1) {
      toast.error("Phải có ít nhất 1 tầng");
      return;
    }

    if (confirm(`Bạn có chắc muốn xóa tầng "${floor.name}"?`)) {
      const updatedFloors = floors.filter((f) => f.id !== floorId);
      onFloorsChange(updatedFloors);
      toast.success("Đã xóa tầng");
    }
  };

  const handleSubmitFloor = () => {
    // Validate
    const nameValidation = validateRequired(floorFormData.name, "Tên tầng");
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    if (floorFormData.level < 1 || floorFormData.level > 50) {
      toast.error("Cấp độ tầng phải từ 1 đến 50");
      return;
    }

    // Check duplicate name or level (except when editing)
    const duplicateName = floors.find(
      (f) => f.name === floorFormData.name && f.id !== editingFloor?.id
    );
    if (duplicateName) {
      toast.error("Tên tầng đã tồn tại");
      return;
    }

    const duplicateLevel = floors.find(
      (f) => f.level === floorFormData.level && f.id !== editingFloor?.id
    );
    if (duplicateLevel) {
      toast.error("Cấp độ tầng đã tồn tại");
      return;
    }

    if (editingFloor) {
      // Update floor
      const updatedFloors = floors.map((f) =>
        f.id === editingFloor.id
          ? {
              ...f,
              name: floorFormData.name,
              level: floorFormData.level,
              description: floorFormData.description,
            }
          : f
      );
      onFloorsChange(updatedFloors);
      toast.success("Đã cập nhật tầng");
    } else {
      // Add new floor
      const newFloor: Floor = {
        id: `F${Date.now()}`,
        name: floorFormData.name,
        level: floorFormData.level,
        description: floorFormData.description,
      };
      onFloorsChange([...floors, newFloor]);
      toast.success("Đã thêm tầng mới");
    }

    setShowFloorModal(false);
    setEditingFloor(null);
  };

  // Helper to count tables in location
  const getTableCountInLocation = (locationName: string) => {
    return tables.filter((t) => t.area === locationName).length;
  };

  // Helper to count locations on floor
  const getLocationCountOnFloor = (floorName: string) => {
    return locations.filter((l) => l.floor === floorName).length;
  };

  return (
    <div>
      {/* Tab Switcher */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 mb-6">
        <button
          onClick={() => setActiveTab("locations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "locations"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Quản lý vị trí
        </button>
        <button
          onClick={() => setActiveTab("floors")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "floors"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Quản lý tầng
        </button>
      </div>

      {/* Locations Tab */}
      {activeTab === "locations" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Danh sách vị trí</h3>
              <p className="text-gray-600 text-sm mt-1">
                Quản lý các vị trí/khu vực trong nhà hàng
              </p>
            </div>
            <Button onClick={handleAddLocation}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm vị trí
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => {
              const tableCount = getTableCountInLocation(location.name);
              const occupiedSeats = tables
                .filter((t) => t.area === location.name)
                .reduce((sum, t) => sum + t.seats, 0);

              return (
                <Card key={location.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{location.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-3 h-3" />
                        <span>{location.floor}</span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {tableCount} bàn
                    </Badge>
                  </div>

                  {location.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {location.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditLocation(location)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteLocation(location.id)}
                      className="text-red-600 hover:bg-red-50"
                      disabled={tableCount > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {tableCount > 0 && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Có {tableCount} bàn đang sử dụng vị trí này</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {locations.length === 0 && (
            <Card className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Chưa có vị trí nào</p>
              <Button onClick={handleAddLocation}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm vị trí đầu tiên
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Floors Tab */}
      {activeTab === "floors" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Danh sách tầng</h3>
              <p className="text-gray-600 text-sm mt-1">
                Quản lý các tầng trong nhà hàng
              </p>
            </div>
            <Button onClick={handleAddFloor}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm tầng
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {floors
              .sort((a, b) => a.level - b.level)
              .map((floor) => {
                const locationCount = getLocationCountOnFloor(floor.name);

                return (
                  <Card key={floor.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{floor.name}</h4>
                        <div className="text-sm text-gray-600">
                          Cấp độ: {floor.level}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        {locationCount} vị trí
                      </Badge>
                    </div>

                    {floor.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {floor.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditFloor(floor)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFloor(floor.id)}
                        className="text-red-600 hover:bg-red-50"
                        disabled={locationCount > 0 || floors.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {locationCount > 0 && (
                      <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>Có {locationCount} vị trí thuộc tầng này</span>
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Location Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setEditingLocation(null);
        }}
        title={editingLocation ? "Chỉnh sửa vị trí" : "Thêm vị trí mới"}
      >
        <div className="space-y-4">
          <Input
            label="Tên vị trí"
            value={locationFormData.name}
            onChange={(e) =>
              setLocationFormData({ ...locationFormData, name: e.target.value })
            }
            placeholder="VD: Main Hall, VIP Room, Outdoor..."
            required
          />

          <Select
            label="Tầng"
            value={locationFormData.floor}
            onChange={(e) =>
              setLocationFormData({
                ...locationFormData,
                floor: e.target.value,
              })
            }
            options={[
              { value: "", label: "Chọn tầng" },
              ...floors.map((f) => ({ value: f.name, label: f.name })),
            ]}
            required
          />

          <Textarea
            label="Mô tả"
            value={locationFormData.description}
            onChange={(e) =>
              setLocationFormData({
                ...locationFormData,
                description: e.target.value,
              })
            }
            placeholder="Mô tả chi tiết về vị trí..."
            rows={3}
          />

          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowLocationModal(false);
                setEditingLocation(null);
              }}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleSubmitLocation}>
              {editingLocation ? "Cập nhật" : "Thêm vị trí"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Floor Modal */}
      <Modal
        isOpen={showFloorModal}
        onClose={() => {
          setShowFloorModal(false);
          setEditingFloor(null);
        }}
        title={editingFloor ? "Chỉnh sửa tầng" : "Thêm tầng mới"}
      >
        <div className="space-y-4">
          <Input
            label="Tên tầng"
            value={floorFormData.name}
            onChange={(e) =>
              setFloorFormData({ ...floorFormData, name: e.target.value })
            }
            placeholder="VD: Floor 1, Floor 2..."
            required
          />

          <Input
            label="Tầng"
            type="number"
            value={floorFormData.level}
            onChange={(e) =>
              setFloorFormData({
                ...floorFormData,
                level: parseInt(e.target.value) || 1,
              })
            }
            min="1"
            max="50"
            required
          />

          <Textarea
            label="Mô tả"
            value={floorFormData.description}
            onChange={(e) =>
              setFloorFormData({
                ...floorFormData,
                description: e.target.value,
              })
            }
            placeholder="Mô tả chi tiết về tầng..."
            rows={3}
          />

          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowFloorModal(false);
                setEditingFloor(null);
              }}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleSubmitFloor}>
              {editingFloor ? "Cập nhật" : "Thêm tầng"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
