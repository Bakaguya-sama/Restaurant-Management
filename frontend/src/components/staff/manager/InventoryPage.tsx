import React, { useState } from "react";
import { Plus, AlertTriangle, Package, Trash2, X, Search } from "lucide-react";
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
import { mockInventory, mockSuppliers } from "../../../lib/mockData";
import { InventoryItem, Supplier } from "../../../types";
import { toast } from "sonner";

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
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

  const handleImport = () => {
    if (!selectedSupplier) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }

    const validItems = importItems.filter(
      (item) =>
        item.quantity > 0 &&
        (item.type === "existing" ? item.existingItemId : item.itemName)
    );
    if (validItems.length === 0) {
      toast.error("Vui lòng nhập ít nhất một nguyên liệu");
      return;
    }

    let updatedInventory = [...inventory];
    let addedCount = 0;
    let updatedCount = 0;

    validItems.forEach((importItem) => {
      if (importItem.type === "existing" && importItem.existingItemId) {
        // Nhập tiếp nguyên liệu cũ: chỉ cộng thêm số lượng
        const existingItemIndex = updatedInventory.findIndex(
          (item) => item.id === importItem.existingItemId
        );
        if (existingItemIndex !== -1) {
          updatedInventory[existingItemIndex] = {
            ...updatedInventory[existingItemIndex],
            quantity:
              updatedInventory[existingItemIndex].quantity +
              importItem.quantity,
            lastUpdated: new Date().toISOString().split("T")[0],
          };
          updatedCount++;
        }
      } else if (importItem.type === "new" && importItem.itemName) {
        // Nhập mới: kiểm tra trùng tên
        const isDuplicate = updatedInventory.some(
          (item) =>
            item.name.toLowerCase() === importItem.itemName.toLowerCase()
        );
        if (isDuplicate) {
          toast.error(
            `Nguyên liệu "${importItem.itemName}" đã tồn tại. Vui lòng chọn "Nhập tiếp" nếu muốn cộng thêm số lượng.`
          );
          return;
        }

        // Thêm nguyên liệu mới
        const newItem: InventoryItem = {
          id: `INV${String(updatedInventory.length + 1).padStart(3, "0")}`,
          name: importItem.itemName,
          quantity: importItem.quantity,
          unit: importItem.unit,
          expiryDate: importItem.expiryDate || undefined,
          supplierId: selectedSupplier,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
        updatedInventory.push(newItem);
        addedCount++;
      }
    });

    setInventory(updatedInventory);

    // Thông báo kết quả
    if (addedCount > 0 && updatedCount > 0) {
      toast.success(
        `Đã nhập kho: ${addedCount} nguyên liệu mới, ${updatedCount} nguyên liệu cập nhật số lượng`
      );
    } else if (addedCount > 0) {
      toast.success(`Đã thêm ${addedCount} nguyên liệu mới vào kho`);
    } else if (updatedCount > 0) {
      toast.success(`Đã cập nhật số lượng cho ${updatedCount} nguyên liệu`);
    }

    setShowImportModal(false);
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

  const handleDispose = () => {
    const item = inventory.find((i) => i.id === disposeData.itemId);
    if (!item) {
      toast.error("Vui lòng chọn nguyên liệu");
      return;
    }

    if (disposeData.quantity <= 0 || disposeData.quantity > item.quantity) {
      toast.error("Số lượng không hợp lệ");
      return;
    }

    const updatedInventory = inventory.map((i) =>
      i.id === disposeData.itemId
        ? { ...i, quantity: i.quantity - disposeData.quantity }
        : i
    );
    setInventory(updatedInventory);

    const reasonText = {
      expired: "hết hạn",
      damaged: "hư hỏng",
      returned: "trả hàng",
    }[disposeData.reason];

    toast.success(
      `Đã xuất hủy ${disposeData.quantity} ${item.unit} ${item.name} (${reasonText})`
    );
    setShowDisposeModal(false);
    setDisposeData({ itemId: "", quantity: 0, reason: "expired" });
  };

  const handleAddSupplier = () => {
    if (!supplierForm.name || !supplierForm.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const newSupplier: Supplier = {
      id: `SUP${String(suppliers.length + 1).padStart(3, "0")}`,
      name: supplierForm.name,
      phone: supplierForm.phone,
      address: supplierForm.address,
    };

    setSuppliers([...suppliers, newSupplier]);
    toast.success("Thêm nhà cung cấp thành công!");
    setShowAddSupplierModal(false);
    setSupplierForm({ name: "", phone: "", address: "" });
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
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-gray-50">
                      {/* <td className="p-4 text-gray-600">{supplier.id}</td> */}
                      <td className="p-4">{supplier.name}</td>
                      <td className="p-4">{supplier.phone}</td>
                      <td className="p-4 text-gray-600">{supplier.address}</td>
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
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
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
                            <option key={invItem.id} value={invItem.id}>
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
                        />
                        <Input
                          placeholder="Đơn vị"
                          value={item.unit}
                          onChange={(e) =>
                            updateImportRow(index, "unit", e.target.value)
                          }
                          className="w-24"
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
                <option key={item.id} value={item.id}>
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
          />

          <div>
            <label className="block mb-2">Lý do</label>
            <div className="space-y-2">
              {[
                { value: "expired", label: "Hết hạn" },
                { value: "damaged", label: "Hư hỏng" },
                { value: "returned", label: "Trả hàng" },
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
          />
          <Input
            label="Số điện thoại"
            value={supplierForm.phone}
            onChange={(e) =>
              setSupplierForm({ ...supplierForm, phone: e.target.value })
            }
            placeholder="Nhập số điện thoại"
          />
          <Input
            label="Địa chỉ"
            value={supplierForm.address}
            onChange={(e) =>
              setSupplierForm({ ...supplierForm, address: e.target.value })
            }
            placeholder="Nhập địa chỉ"
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
    </div>
  );
}
