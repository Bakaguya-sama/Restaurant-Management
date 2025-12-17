import React, { useState } from "react";
import {
  Plus,
  AlertTriangle,
  Package,
  Trash2,
  X,
  Search,
  Edit,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { InventoryItem, Supplier } from "../../../types";
import { toast } from "sonner";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { useInventory, useSuppliers } from "../../../hooks/useInventory";
import {
  importInventoryItems,
  exportInventoryItems,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../../lib/inventoryPageApi";

export function InventoryPage() {
  // Fetch data from API
  const {
    items: inventory,
    loading: inventoryLoading,
    error: inventoryError,
    refresh: refreshInventory,
  } = useInventory();
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
    refresh: refreshSuppliers,
  } = useSuppliers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [showDeleteSupplierModal, setShowDeleteSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [importItems, setImportItems] = useState<
    Array<{
      type: "new" | "existing";
      existingItemId?: string;
      itemName: string;
      quantity: number;
      unit: string;
      price: number;
      expiryDate: string;
      storageLocation: string;
    }>
  >([
    {
      type: "new",
      itemName: "",
      quantity: 0,
      unit: "",
      price: 0,
      expiryDate: "",
      storageLocation: "",
    },
  ]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [disposeData, setDisposeData] = useState({
    itemId: "",
    quantity: 0,
    reason: "expired" as "expired" | "damaged" | "returned",
  });
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpiringSoon = (expiryDate: string) => {
    return getDaysUntilExpiry(expiryDate) <= 7;
  };

  const isExpired = (expiryDate: string) => {
    return getDaysUntilExpiry(expiryDate) < 0;
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (statusFilter === "all") {
      return matchesSearch;
    } else if (statusFilter === "expired") {
      return matchesSearch && item.expiryDate && isExpired(item.expiryDate);
    } else if (statusFilter === "expiring") {
      return (
        matchesSearch &&
        item.expiryDate &&
        isExpiringSoon(item.expiryDate) &&
        !isExpired(item.expiryDate)
      );
    } else if (statusFilter === "low-stock") {
      return matchesSearch && item.quantity < 10;
    } else if (statusFilter === "normal") {
      const expired = item.expiryDate && isExpired(item.expiryDate);
      const expiring = item.expiryDate && isExpiringSoon(item.expiryDate);
      const lowStock = item.quantity < 10;
      return matchesSearch && !expired && !expiring && !lowStock;
    }
    return matchesSearch;
  });

  const addImportRow = () => {
    setImportItems([
      ...importItems,
      {
        type: "new",
        itemName: "",
        quantity: 0,
        unit: "",
        price: 0,
        expiryDate: "",
        storageLocation: "",
      },
    ]);
  };

  const removeImportRow = (index: number) => {
    setImportItems(importItems.filter((_, i) => i !== index));
  };

  const updateImportRow = (index: number, field: string, value: any) => {
    const newItems = [...importItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setImportItems(newItems);
  };

  const handleImport = async () => {
    if (!selectedSupplier) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }

    // Filter valid items - check for both new and existing types
    const validItems = importItems.filter((item) => {
      if (item.quantity <= 0) return false;
      if (item.type === "existing") return !!item.existingItemId;
      if (item.type === "new") return !!item.itemName && !!item.unit;
      return false;
    });
    
    if (validItems.length === 0) {
      toast.error("Vui lòng nhập đầy đủ thông tin nguyên liệu và số lượng");
      return;
    }

    try {
      // Map to API format
      const items = validItems.map((importItem) => {
        if (importItem.type === "existing") {
          return {
            itemId: importItem.existingItemId!,
            quantity: importItem.quantity,
            supplierId: selectedSupplier,
            expiryDate: importItem.expiryDate || new Date().toISOString().split('T')[0],
          };
        } else {
          // New ingredient
          return {
            name: importItem.itemName,
            unit: importItem.unit,
            unitPrice: importItem.price,
            quantity: importItem.quantity,
            supplierId: selectedSupplier,
            expiryDate: importItem.expiryDate || new Date().toISOString().split('T')[0],
          };
        }
      });

      await importInventoryItems({
        items,
      });

      toast.success("Đã nhập kho thành công!");
      await refreshInventory();
      setShowImportModal(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể nhập kho");
    }
    setImportItems([
      {
        type: "new",
        itemName: "",
        quantity: 0,
        unit: "",
        price: 0,
        expiryDate: "",
        storageLocation: "",
      },
    ]);
    setSelectedSupplier("");
  };

  const handleDispose = async () => {
    const item = inventory.find((i) => i.ingredientId === disposeData.itemId);
    if (!item) {
      toast.error("Vui lòng chọn nguyên liệu");
      return;
    }

    if (disposeData.quantity <= 0 || disposeData.quantity > item.quantity) {
      toast.error("Số lượng không hợp lệ");
      return;
    }

    try {
      await exportInventoryItems({
        items: [
          {
            itemId: disposeData.itemId,
            quantity: disposeData.quantity,
            reason: disposeData.reason,
          },
        ],
      });

      const reasonText = {
        expired: "hết hạn",
        damaged: "hư hỏng",
        returned: "trả hàng",
      }[disposeData.reason];

      toast.success(
        `Đã xuất hủy ${disposeData.quantity} ${item.unit} ${item.name} (${reasonText})`
      );
      await refreshInventory();
      setShowDisposeModal(false);
      setDisposeData({ itemId: "", quantity: 0, reason: "expired" });
    } catch (error: any) {
      toast.error(error.message || "Không thể xuất hủy");
    }
  };

  const handleAddSupplier = async () => {
    if (!supplierForm.name.trim() || !supplierForm.phone.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate phone number format (10-11 digits)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(supplierForm.phone.trim())) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    // Check if supplier name already exists
    const isDuplicate = suppliers.some(
      (s) =>
        s.name.toLowerCase().trim() === supplierForm.name.toLowerCase().trim()
    );
    if (isDuplicate) {
      toast.error("Tên nhà cung cấp đã tồn tại");
      return;
    }

    try {
      await createSupplier({
        name: supplierForm.name.trim(),
        phone: supplierForm.phone.trim(),
        address: supplierForm.address.trim(),
      });

      toast.success("Thêm nhà cung cấp thành công!");
      await refreshSuppliers();
      setShowAddSupplierModal(false);
      setSupplierForm({ name: "", phone: "", address: "" });
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm nhà cung cấp");
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
    });
    setShowEditSupplierModal(true);
  };

  const handleUpdateSupplier = async () => {
    if (
      !editingSupplier ||
      !supplierForm.name.trim() ||
      !supplierForm.phone.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate phone number format (10-11 digits)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(supplierForm.phone.trim())) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    // Check if supplier name already exists (excluding current supplier)
    const isDuplicate = suppliers.some(
      (s) =>
        s.id !== editingSupplier.id &&
        s.name.toLowerCase().trim() === supplierForm.name.toLowerCase().trim()
    );
    if (isDuplicate) {
      toast.error("Tên nhà cung cấp đã tồn tại");
      return;
    }

    try {
      await updateSupplier(editingSupplier.id, {
        name: supplierForm.name.trim(),
        phone: supplierForm.phone.trim(),
        address: supplierForm.address.trim(),
      });

      toast.success("Cập nhật nhà cung cấp thành công!");
      await refreshSuppliers();
      setShowEditSupplierModal(false);
      setEditingSupplier(null);
      setSupplierForm({ name: "", phone: "", address: "" });
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật nhà cung cấp");
    }
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    // Check if supplier is assigned to any inventory item
    const isAssigned = inventory.some(
      (item) => item.supplierId === supplier.id
    );

    if (isAssigned) {
      toast.error(
        "Không thể xóa nhà cung cấp này vì đã được gán cho nguyên liệu"
      );
      return;
    }

    setEditingSupplier(supplier);
    setShowDeleteSupplierModal(true);
  };

  const confirmDeleteSupplier = async () => {
    if (!editingSupplier) return;

    try {
      await deleteSupplier(editingSupplier.id);
      toast.success("Đã xóa nhà cung cấp");
      await refreshSuppliers();
      setShowDeleteSupplierModal(false);
      setEditingSupplier(null);
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa nhà cung cấp");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2>Quản lý kho</h2>
        <p className="text-gray-600 mt-1">
          Quản lý tồn kho, nhập xuất và nhà cung cấp
        </p>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="h-14 p-1">
          <TabsTrigger value="inventory" className="px-6 py-2 text-base">
            Tồn kho
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="px-6 py-2 text-base">
            Nhà cung cấp
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="flex gap-4">
            <Button onClick={() => setShowImportModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nhập kho
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDisposeModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xử lý hàng hỏng
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm nguyên liệu..."
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="normal">Bình thường</SelectItem>
                  <SelectItem value="low-stock">Sắp hết hàng</SelectItem>
                  <SelectItem value="expiring">Sắp hết hạn</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerts */}
          {/* {inventory.some(
            (item) => item.expiryDate && isExpiringSoon(item.expiryDate)
          ) && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-yellow-800 mb-1">
                    Cảnh báo hàng sắp hết hạn
                  </p>
                  <p className="text-sm text-yellow-700">
                    Có{" "}
                    {
                      inventory.filter(
                        (item) =>
                          item.expiryDate && isExpiringSoon(item.expiryDate)
                      ).length
                    }{" "}
                    nguyên liệu sắp hết hạn trong 7 ngày tới
                  </p>
                </div>
              </div>
            </Card>
          )} */}

          {/* Inventory Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {/* <th className="text-left p-4">Mã</th> */}
                    <th className="text-left p-4">Tên nguyên liệu</th>
                    <th className="text-left p-4">Số lượng</th>
                    <th className="text-left p-4">Đơn vị</th>
                    <th className="text-left p-4">Hạn sử dụng</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const daysLeft = item.expiryDate
                      ? getDaysUntilExpiry(item.expiryDate)
                      : null;
                    const isLowStock = item.quantity < 10;
                    const expired =
                      item.expiryDate && isExpired(item.expiryDate);
                    const expiring =
                      item.expiryDate && isExpiringSoon(item.expiryDate);

                    // className={`border-b hover:bg-gray-50 ${
                    //     expired ? "bg-red-50" : expiring ? "bg-yellow-50" : ""
                    //   }`}
                    return (
                      <tr
                        key={item.id}
                        className={`border-b hover:bg-gray-50 
                        }`}
                      >
                        {/* <td className="p-4 text-gray-600">{item.id}</td> */}
                        <td className="p-4">{item.name}</td>
                        <td className="p-4">
                          <span className={isLowStock ? "text-orange-600" : ""}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{item.unit}</td>
                        <td className="p-4">
                          {item.expiryDate ? (
                            <div>
                              <p>
                                {new Date(item.expiryDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                              {daysLeft !== null && (
                                <p
                                  className={`text-sm ${
                                    expired
                                      ? "text-red-600"
                                      : expiring
                                      ? "text-yellow-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {expired
                                    ? `Đã hết hạn ${Math.abs(daysLeft)} ngày`
                                    : `Còn ${daysLeft} ngày`}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {expired && (
                              <Badge className="bg-red-100 text-red-700">
                                Hết hạn
                              </Badge>
                            )}
                            {!expired && expiring && (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                Sắp hết hạn
                              </Badge>
                            )}
                            {isLowStock && (
                              <Badge className="bg-orange-100 text-orange-700">
                                Sắp hết
                              </Badge>
                            )}
                            {!expired && !expiring && !isLowStock && (
                              <Badge className="bg-green-100 text-green-700">
                                Tốt
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(item.lastUpdated).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Button onClick={() => setShowAddSupplierModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhà cung cấp
          </Button>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {/* <th className="text-left p-4">Mã NCC</th> */}
                    <th className="text-left p-4">Tên công ty</th>
                    <th className="text-left p-4">Số điện thoại</th>
                    <th className="text-left p-4">Địa chỉ</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-gray-50">
                      {/* <td className="p-4 text-gray-600">{supplier.id}</td> */}
                      <td className="p-4">{supplier.name}</td>
                      <td className="p-4">{supplier.phone}</td>
                      <td className="p-4 text-gray-600">{supplier.address}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(supplier)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Tạo phiếu nhập kho"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block mb-2">Nhà cung cấp</label>
            <select
              value={selectedSupplier}
              onChange={(e) => {
                console.log('Selected supplier ID:', e.target.value);
                console.log('All suppliers:', suppliers);
                setSelectedSupplier(e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((supplier) => {
                console.log('Supplier:', supplier);
                return (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label>Danh sách nguyên liệu</label>
              <Button size="sm" variant="secondary" onClick={addImportRow}>
                <Plus className="w-4 h-4 mr-1" />
                Thêm dòng
              </Button>
            </div>

            <div className="space-y-3">
              {importItems.map((item, index) => (
                <div key={index} className="space-y-3 p-4 border rounded-lg">
                  {/* Chọn loại nhập */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Loại nhập
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`type-${index}`}
                          value="new"
                          checked={item.type === "new"}
                          onChange={(e) =>
                            updateImportRow(index, "type", "new")
                          }
                          className="w-4 h-4"
                        />
                        <span>Nhập mới</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`type-${index}`}
                          value="existing"
                          checked={item.type === "existing"}
                          onChange={(e) =>
                            updateImportRow(index, "type", "existing")
                          }
                          className="w-4 h-4"
                        />
                        <span>Nhập tiếp nguyên liệu cũ</span>
                      </label>
                    </div>
                  </div>

                  {/* Nếu chọn nhập tiếp: chỉ hiển thị dropdown chọn nguyên liệu và số lượng */}
                  {item.type === "existing" ? (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Nguyên liệu
                        </label>
                        <select
                          value={item.existingItemId || ""}
                          onChange={(e) =>
                            updateImportRow(
                              index,
                              "existingItemId",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Chọn nguyên liệu</option>
                          {inventory.map((invItem) => (
                            <option key={invItem.id} value={invItem.ingredientId}>
                              {invItem.name} (Tồn: {invItem.quantity}{" "}
                              {invItem.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-3 items-start">
                        <Input
                          type="number"
                          placeholder="Số lượng nhập thêm"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateImportRow(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="flex-1"
                          min="1"
                          step="0.01"
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Đơn giá"
                          value={item.price || ""}
                          onChange={(e) =>
                            updateImportRow(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="flex-1"
                          min="0"
                          step="1000"
                          required
                        />
                        {importItems.length > 1 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => removeImportRow(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Nếu chọn nhập mới: hiển thị form đầy đủ */
                    <>
                      <div className="flex gap-3 items-start">
                        <Input
                          placeholder="Tên nguyên liệu"
                          value={item.itemName}
                          onChange={(e) =>
                            updateImportRow(index, "itemName", e.target.value)
                          }
                          className="flex-1"
                          required
                          minLength={2}
                          maxLength={100}
                        />
                        <Input
                          type="number"
                          placeholder="Số lượng"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateImportRow(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24"
                          min="1"
                          step="0.01"
                          required
                        />
                        <Input
                          placeholder="Đơn vị"
                          value={item.unit}
                          onChange={(e) =>
                            updateImportRow(index, "unit", e.target.value)
                          }
                          className="w-24"
                          required
                          maxLength={20}
                        />
                        <Input
                          type="number"
                          placeholder="Đơn giá"
                          value={item.price || ""}
                          onChange={(e) =>
                            updateImportRow(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-32"
                          min="0"
                          step="1000"
                          required
                        />
                        {importItems.length > 1 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => removeImportRow(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            Hạn sử dụng
                          </label>
                          <Input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) =>
                              updateImportRow(
                                index,
                                "expiryDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            Vị trí lưu trữ
                          </label>
                          <Input
                            placeholder="VD: Kệ A1, Tủ lạnh B2"
                            value={item.storageLocation}
                            onChange={(e) =>
                              updateImportRow(
                                index,
                                "storageLocation",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span>Tổng tiền:</span>
                <span className="text-xl text-[#625EE8]">
                  {importItems
                    .reduce((sum, item) => sum + item.quantity * item.price, 0)
                    .toLocaleString()}
                  đ
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowImportModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleImport}>
              Lưu phiếu nhập
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dispose Modal */}
      <Modal
        isOpen={showDisposeModal}
        onClose={() => setShowDisposeModal(false)}
        title="Xử lý hàng hỏng"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Chọn nguyên liệu</label>
            <select
              value={disposeData.itemId}
              onChange={(e) =>
                setDisposeData({ ...disposeData, itemId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Chọn nguyên liệu</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.ingredientId}>
                  {item.name} (Tồn: {item.quantity} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Số lượng hủy"
            type="number"
            value={disposeData.quantity || ""}
            onChange={(e) =>
              setDisposeData({
                ...disposeData,
                quantity: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="Nhập số lượng"
            min="1"
            step="0.01"
            required
          />

          <div>
            <label className="block mb-2">Lý do</label>
            <div className="space-y-2">
              {[
                { value: "expired", label: "Hết hạn" },
                { value: "damaged", label: "Hư hỏng" },
                { value: "returned", label: "Trả hàng" },
                { value: "edited", label: "Xóa để chỉnh sửa" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={disposeData.reason === option.value}
                    onChange={(e) =>
                      setDisposeData({
                        ...disposeData,
                        reason: e.target.value as any,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDisposeModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleDispose}>
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={showAddSupplierModal}
        onClose={() => setShowAddSupplierModal(false)}
        title="Thêm nhà cung cấp"
      >
        <div className="space-y-4">
          <Input
            label="Tên công ty"
            value={supplierForm.name}
            onChange={(e) =>
              setSupplierForm({ ...supplierForm, name: e.target.value })
            }
            placeholder="Nhập tên công ty"
            required
            minLength={2}
            maxLength={100}
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={supplierForm.phone}
            onChange={(e) =>
              setSupplierForm({ ...supplierForm, phone: e.target.value })
            }
            placeholder="Nhập số điện thoại (VD: 0901234567)"
            required
            pattern="[0-9]{10,11}"
            minLength={10}
            maxLength={11}
          />
          <Input
            label="Địa chỉ"
            value={supplierForm.address}
            onChange={(e) =>
              setSupplierForm({ ...supplierForm, address: e.target.value })
            }
            placeholder="Nhập địa chỉ"
            minLength={5}
            maxLength={200}
          />
          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowAddSupplierModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleAddSupplier}>
              Thêm NCC
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal
        isOpen={showEditSupplierModal}
        onClose={() => {
          setShowEditSupplierModal(false);
          setEditingSupplier(null);
          setSupplierForm({ name: "", phone: "", address: "" });
        }}
        title="Chỉnh sửa nhà cung cấp"
      >
        <div className="space-y-4">
          <Input
            label="Tên công ty"
            value={supplierForm.name}
            onChange={(e) =>
              setSupplierForm({ ...supplierForm, name: e.target.value })
            }
            placeholder="Nhập tên công ty"
            required
            minLength={2}
            maxLength={100}
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={supplierForm.phone}
            onChange={(e) =>
              setSupplierForm({ ...supplierForm, phone: e.target.value })
            }
            placeholder="Nhập số điện thoại (VD: 0901234567)"
            required
            pattern="[0-9]{10,11}"
            minLength={10}
            maxLength={11}
          />
          <Input
            label="Địa chỉ"
            value={supplierForm.address}
            onChange={(e) =>
              setSupplierForm({ ...supplierForm, address: e.target.value })
            }
            placeholder="Nhập địa chỉ"
            minLength={5}
            maxLength={200}
          />
          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowEditSupplierModal(false);
                setEditingSupplier(null);
                setSupplierForm({ name: "", phone: "", address: "" });
              }}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleUpdateSupplier}>
              Cập nhật
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Supplier Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteSupplierModal}
        onClose={() => {
          setShowDeleteSupplierModal(false);
          setEditingSupplier(null);
        }}
        onConfirm={confirmDeleteSupplier}
        title="Xác nhận xóa nhà cung cấp"
        message={`Bạn có chắc chắn muốn xóa nhà cung cấp "${editingSupplier?.name}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}
