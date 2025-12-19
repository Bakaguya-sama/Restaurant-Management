import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Building2,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Textarea, Select } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import { Location, Floor, Table } from "../../../types";
import { toast } from "sonner";
import { validateRequired } from "../../../lib/validation";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { useFloors } from "../../../hooks/useFloors";
import { useLocations } from "../../../hooks/useLocations";

interface LocationManagementProps {
  locations: Location[];
  floors: Floor[];
  tables: Table[];
  onLocationsChange: (locations: Location[]) => void;
  onFloorsChange: (floors: Floor[]) => void;
  onRefreshLocations?: () => Promise<void>;
  onRefreshFloors?: () => Promise<void>;
}

export function LocationManagement({
  locations,
  tables,
  onLocationsChange,
  onFloorsChange,
  onRefreshLocations,
  onRefreshFloors,
}: LocationManagementProps) {
  const [activeTab, setActiveTab] = useState<"locations" | "floors">(
    "locations"
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmCancelText, setConfirmCancelText] = useState("Hủy");
  const [confirmVariant, setConfirmVariant] = useState<
    "info" | "warning" | "danger"
  >("info");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const {
    floors,
    loading: floorsLoading,
    error: floorsError,
    createFloor,
    updateFloor,
    deleteFloor,
    fetchFloors,
  } = useFloors();

  const {
    locations: apiLocations,
    loading: locationsLoading,
    error: locationsError,
    createLocation,
    updateLocation,
    deleteLocation,
    fetchLocations,
  } = useLocations();

  
  useEffect(() => {
    if (apiLocations && apiLocations.length > 0) {
      onLocationsChange(apiLocations);
    }
  }, [apiLocations]);

  
  useEffect(() => {
    if (floors && floors.length > 0) {
      onFloorsChange(floors);
    }
  }, [floors]);

  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationFormData, setLocationFormData] = useState({
    name: "",
    floor_id: "",
    description: "",
    createdAt: "",
  });

  
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [floorFormData, setFloorFormData] = useState({
    name: "",
    floor_number: 1,
    description: "",
    createdAt: "",
  });

  
  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationFormData({
      name: "",
      floor_id: floors[0]?.id || "",
      description: "",
      createdAt: "",
    });
    setShowLocationModal(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setLocationFormData({
      name: location.name,
      floor_id: location.floor_id,
      description: location.description || "",
      createdAt: location.createdAt || "",
    });
    setShowLocationModal(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    const location = apiLocations.find((l) => l.id === locationId);
    if (!location) return;

    
    const tablesInLocation = tables.filter((t) => t.location_id === location.id);

    if (tablesInLocation.length > 0) {
      toast.error(
        `Không thể xóa vị trí "${location.name}" vì còn ${tablesInLocation.length} bàn đang sử dụng vị trí này`,
        { duration: 4000 }
      );
      return;
    }

    setConfirmTitle(`Xóa vị trí`);
    setConfirmMessage(`Bạn có chắc muốn xóa vị trí này?`);
    setConfirmText("Xóa");
    setConfirmCancelText("Hủy");
    setConfirmVariant(`warning`);
    setPendingAction(() => async () => {
      try {
        setIsSubmitting(true);
        await deleteLocation(locationId);
        toast.success("Đã xóa vị trí thành công");
        await fetchLocations();
        if (onRefreshLocations) {
          await onRefreshLocations();
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Lỗi khi xóa vị trí"
        );
      } finally {
        setIsSubmitting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleSubmitLocation = async () => {
    
    const nameValidation = validateRequired(
      locationFormData.name,
      "Tên vị trí"
    );
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    const floorValidation = validateRequired(locationFormData.floor_id, "Tầng");
    if (!floorValidation.isValid) {
      toast.error(floorValidation.error);
      return;
    }

    
    const duplicateName = apiLocations.find(
      (l) => l.name === locationFormData.name && l.id !== editingLocation?.id
    );
    if (duplicateName) {
      toast.error("Tên vị trí đã tồn tại");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingLocation) {
        
        await updateLocation(editingLocation.id, {
          name: locationFormData.name,
          floor_id: locationFormData.floor_id,
          description: locationFormData.description,
        });
        toast.success("Đã cập nhật vị trí thành công");
        await fetchLocations();
        if (onRefreshLocations) {
          await onRefreshLocations();
        }
      } else {
        await createLocation({
          name: locationFormData.name,
          floor_id: locationFormData.floor_id,
          description: locationFormData.description,
        });
        toast.success("Đã thêm vị trí mới thành công");
        await fetchLocations();
        if (onRefreshLocations) {
          await onRefreshLocations();
        }
      }

      setShowLocationModal(false);
      setEditingLocation(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi lưu vị trí"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocationCountOnFloor = (floor_id: string) => {
    return apiLocations.filter((l) => l.floor_id === floor_id).length;
  };

  
  const getFloorName = (floor_id: string) => {
    const floor = floors.find((f) => f.id === floor_id);
    return floor ? floor.floor_name : "Không xác định";
  };

  
  const handleAddFloor = () => {
    setEditingFloor(null);
    const nextNumber = Math.max(...floors.map((f) => f.floor_number), 0) + 1;
    setFloorFormData({
      name: `Tầng ${nextNumber}`,
      floor_number: nextNumber,
      description: "",
      createdAt: "",
    });
    setShowFloorModal(true);
  };

  const handleEditFloor = (floor: Floor) => {
    setEditingFloor(floor);
    setFloorFormData({
      name: floor.floor_name,
      floor_number: floor.floor_number,
      description: floor.description || "",
      createdAt: floor.createdAt || "",
    });
    setShowFloorModal(true);
  };

  const handleDeleteFloor = (floorId: string) => {
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return;

    
    const locationsOnFloor = locations.filter((l) => l.floor_id === floor.id);

    if (locationsOnFloor.length > 0) {
      toast.error(
        `Không thể xóa tầng "${floor.floor_name}" vì còn ${locationsOnFloor.length} vị trí đang thuộc tầng này`,
        { duration: 4000 }
      );
      return;
    }

    if (floors.length <= 1) {
      toast.error("Phải có ít nhất 1 tầng");
      return;
    }

    setConfirmTitle(`Xóa tầng`);
    setConfirmMessage(`Bạn có chắc muốn xóa tầng "${floor.floor_name}"?`);
    setConfirmText("Xóa");
    setConfirmCancelText("Hủy");
    setConfirmVariant(`danger`);
    setPendingAction(() => async () => {
      try {
        setIsSubmitting(true);
        await deleteFloor(floorId);
        toast.success("Đã xóa tầng thành công");
        await fetchFloors();
        if (onRefreshFloors) {
          await onRefreshFloors();
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Lỗi khi xóa tầng"
        );
      } finally {
        setIsSubmitting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleSubmitFloor = async () => {
    
    const nameValidation = validateRequired(floorFormData.name, "Tên tầng");
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    if (floorFormData.floor_number < 1 || floorFormData.floor_number > 50) {
      toast.error("Số tầng phải từ 1 đến 50");
      return;
    }

    
    const duplicateName = floors.find(
      (f) => f.floor_name === floorFormData.name && f.id !== editingFloor?.id
    );
    if (duplicateName) {
      toast.error("Tên tầng đã tồn tại");
      return;
    }

    const duplicateNumber = floors.find(
      (f) => f.floor_number === floorFormData.floor_number && f.id !== editingFloor?.id
    );
    if (duplicateNumber) {
      toast.error("Số tầng đã tồn tại");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingFloor) {
        await updateFloor(editingFloor.id, {
          floor_name: floorFormData.name,
          floor_number: floorFormData.floor_number,
          description: floorFormData.description,
        });
        toast.success("Đã cập nhật tầng thành công");
        await fetchFloors();
        if (onRefreshFloors) {
          await onRefreshFloors();
        }
      } else {
        await createFloor({
          floor_name: floorFormData.name,
          floor_number: floorFormData.floor_number,
          description: floorFormData.description,
        });
        toast.success("Đã thêm tầng mới thành công");
        await fetchFloors();
        if (onRefreshFloors) {
          await onRefreshFloors();
        }
      }

      setShowFloorModal(false);
      setEditingFloor(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi lưu tầng"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTableCountInLocation = (locationId: string) => {
    return tables.filter((t) => t.location_id === locationId).length;
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
            <Button onClick={handleAddLocation} disabled={locationsLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm vị trí
            </Button>
          </div>

          {/* Error Alert */}
          {locationsError && (
            <Card className="p-4 mb-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">
                    Lỗi tải dữ liệu
                  </h4>
                  <p className="text-sm text-red-700 mb-3">{locationsError}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-100"
                    onClick={fetchLocations}
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {locationsLoading ? (
            <Card className="p-8 text-center">
              <Loader className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Đang tải dữ liệu vị trí...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apiLocations && apiLocations.length > 0 ? (
                apiLocations.map((location) => {
                  const tableCount = getTableCountInLocation(location.id);
                  const floorName = getFloorName(location.floor_id);

                  return (
                    <Card key={location.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{location.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-3 h-3" />
                            <span>{floorName}</span>
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
                          disabled={locationsLoading}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 hover:bg-red-50"
                          disabled={tableCount > 0 || locationsLoading}
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
                })
              ) : (
                <Card className="p-8 text-center col-span-full">
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
            <Button onClick={handleAddFloor} disabled={floorsLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm tầng
            </Button>
          </div>

          {/* Error Alert */}
          {floorsError && (
            <Card className="p-4 mb-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">
                    Lỗi tải dữ liệu
                  </h4>
                  <p className="text-sm text-red-700 mb-3">{floorsError}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-100"
                    onClick={fetchFloors}
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {floorsLoading ? (
            <Card className="p-8 text-center">
              <Loader className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Đang tải dữ liệu tầng...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {floors && floors.length > 0 ? (
                floors
                  .sort((a, b) => a.floor_number - b.floor_number)
                  .map((floor) => {
                    const locationCount = getLocationCountOnFloor(
                      floor.id
                    );

                    return (
                      <Card key={floor.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">
                              {floor.floor_name}
                            </h4>
                            <div className="text-sm text-gray-600">
                              Tầng số: {floor.floor_number}
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
                            disabled={floorsLoading}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFloor(floor.id)}
                            className="text-red-600 hover:bg-red-50"
                            disabled={
                              locationCount > 0 ||
                              floors.length <= 1 ||
                              floorsLoading
                            }
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
                  })
              ) : (
                <Card className="p-8 text-center col-span-full">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Chưa có tầng nào</p>
                  <Button onClick={handleAddFloor}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm tầng đầu tiên
                  </Button>
                </Card>
              )}
            </div>
          )}
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
            value={locationFormData.floor_id}
            onChange={(e) =>
              setLocationFormData({
                ...locationFormData,
                floor_id: e.target.value,
              })
            }
            options={[
              { value: "", label: "Chọn tầng" },
              ...(floors || []).map((f) => ({
                value: f.id,
                label: f.floor_name,
              })),
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
            <Button
              fullWidth
              onClick={handleSubmitLocation}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Đang lưu..."
                : editingLocation
                  ? "Cập nhật"
                  : "Thêm vị trí"}
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
            placeholder="VD: Tầng 1, Tầng 2..."
            required
          />

          <Input
            label="Số tầng"
            type="number"
            value={floorFormData.floor_number}
            onChange={(e) =>
              setFloorFormData({
                ...floorFormData,
                floor_number: parseInt(e.target.value) || 1,
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
            <Button
              fullWidth
              onClick={handleSubmitFloor}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Đang lưu..."
                : editingFloor
                  ? "Cập nhật"
                  : "Thêm tầng"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
