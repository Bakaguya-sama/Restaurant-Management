import React, { useState, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  Search,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Textarea } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Switch } from "../../ui/switch";
import {
  mockMenuItems,
  mockPromotions,
  mockInventory,
} from "../../../lib/mockData";
import { MenuItem, Promotion } from "../../../types";
import { toast } from "sonner";
import {
  validateRequired,
  validatePositiveNumber,
  validateNumberRange,
} from "../../../lib/validation";

export function MenuPromotionPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [ingredientRows, setIngredientRows] = useState<
    Array<{ ingredientId: string; quantity: number }>
  >([{ ingredientId: "", quantity: 0 }]);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "Món chính",
    price: 0,
    description: "",
    image: "",
  });
  const [promoForm, setPromoForm] = useState({
    name: "",
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    promotionQuantity: 0,
    startDate: "",
    endDate: "",
  });

  const addIngredientRow = () => {
    setIngredientRows([...ingredientRows, { ingredientId: "", quantity: 0 }]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredientRows(ingredientRows.filter((_, i) => i !== index));
  };

  const updateIngredientRow = (index: number, field: string, value: any) => {
    const newRows = [...ingredientRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setIngredientRows(newRows);
  };

  const handleAddMenuItem = () => {
    // Validate name
    const nameValidation = validateRequired(menuForm.name, "Tên món ăn");
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    // Validate price
    const priceValidation = validatePositiveNumber(
      menuForm.price,
      "Giá món ăn"
    );
    if (!priceValidation.isValid) {
      toast.error(priceValidation.error);
      return;
    }

    // Build ingredients array from valid rows
    const validIngredients = ingredientRows
      .filter((row) => row.ingredientId !== "")
      .map((row) => {
        const ingredient = mockInventory.find(
          (inv) => inv.id === row.ingredientId
        );
        return ingredient
          ? `${ingredient.name} (${row.quantity} ${ingredient.unit})`
          : "";
      })
      .filter((ing) => ing !== "");

    const newItem: MenuItem = {
      id: String(menuItems.length + 1),
      name: menuForm.name,
      category: menuForm.category,
      price: menuForm.price,
      description: menuForm.description,
      available: true,
      ingredients: validIngredients.length > 0 ? validIngredients : undefined,
      image:
        "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400",
    };

    setMenuItems([...menuItems, newItem]);
    toast.success("Thêm món ăn thành công!");
    setShowAddMenuModal(false);
    setMenuForm({
      name: "",
      category: "Món chính",
      price: 0,
      description: "",
      image: "",
    });
    setIngredientRows([{ ingredientId: "", quantity: 0 }]);
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const handleEditMenuItem = () => {
    if (!editingDish) return;

    // Validate
    const nameValidation = validateRequired(menuForm.name, "Tên món ăn");
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    const priceValidation = validatePositiveNumber(
      menuForm.price,
      "Giá món ăn"
    );
    if (!priceValidation.isValid) {
      toast.error(priceValidation.error);
      return;
    }

    // Build ingredients
    const validIngredients = ingredientRows
      .filter((row) => row.ingredientId !== "")
      .map((row) => {
        const ingredient = mockInventory.find(
          (inv) => inv.id === row.ingredientId
        );
        return ingredient
          ? `${ingredient.name} (${row.quantity} ${ingredient.unit})`
          : "";
      })
      .filter((ing) => ing !== "");

    // Update menu item
    setMenuItems(
      menuItems.map((item) =>
        item.id === editingDish.id
          ? {
              ...item,
              name: menuForm.name,
              category: menuForm.category,
              price: menuForm.price,
              description: menuForm.description,
              image: menuForm.image || item.image,
              ingredients:
                validIngredients.length > 0 ? validIngredients : undefined,
            }
          : item
      )
    );

    toast.success("Cập nhật món ăn thành công!");
    setShowEditMenuModal(false);
    setEditingDish(null);
    setMenuForm({
      name: "",
      category: "Món chính",
      price: 0,
      description: "",
      image: "",
    });
    setIngredientRows([{ ingredientId: "", quantity: 0 }]);
  };

  const openEditModal = (dish: MenuItem) => {
    setEditingDish(dish);
    setMenuForm({
      name: dish.name,
      category: dish.category,
      price: dish.price,
      description: dish.description || "",
      image: dish.image || "",
    });

    // Parse ingredients back to rows (simplified - just empty rows for now)
    setIngredientRows([{ ingredientId: "", quantity: 0 }]);
    setShowEditMenuModal(true);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa món ăn này?")) {
      setMenuItems(menuItems.filter((item) => item.id !== id));
      toast.success("Đã xóa món ăn");
    }
  };

  const handleAddPromotion = () => {
    // Validate name
    const nameValidation = validateRequired(promoForm.name, "Tên chương trình");
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    // Validate code
    const codeValidation = validateRequired(promoForm.code, "Mã khuyến mãi");
    if (!codeValidation.isValid) {
      toast.error(codeValidation.error);
      return;
    }

    // Validate discount value
    const discountValidation = validatePositiveNumber(
      promoForm.discountValue,
      "Giá trị giảm giá"
    );
    if (!discountValidation.isValid) {
      toast.error(discountValidation.error);
      return;
    }

    // If percentage, check range 0-100
    if (promoForm.discountType === "percentage") {
      const rangeValidation = validateNumberRange(
        promoForm.discountValue,
        0.01,
        100,
        "Phần trăm giảm giá"
      );
      if (!rangeValidation.isValid) {
        toast.error(rangeValidation.error);
        return;
      }
    }

    const newPromo: Promotion = {
      id: `PROMO${String(promotions.length + 1).padStart(3, "0")}`,
      name: promoForm.name,
      code: promoForm.code,
      discountType: promoForm.discountType,
      discountValue: promoForm.discountValue,
      promotionQuantity: promoForm.promotionQuantity || undefined,
      startDate: promoForm.startDate,
      endDate: promoForm.endDate,
      active: true,
    };

    setPromotions([...promotions, newPromo]);
    toast.success("Thêm khuyến mãi thành công!");
    setShowAddPromoModal(false);
    setPromoForm({
      name: "",
      code: "",
      discountType: "percentage",
      discountValue: 0,
      promotionQuantity: 0,
      startDate: "",
      endDate: "",
    });
  };

  const handleTogglePromotion = (id: string) => {
    setPromotions(
      promotions.map((promo) =>
        promo.id === id ? { ...promo, active: !promo.active } : promo
      )
    );
  };

  const categories = ["all", "Khai vị", "Món chính", "Đồ uống", "Tráng miệng"];

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="mb-6">
        <h2>Quản lý thực đơn & Khuyến mãi</h2>
        <p className="text-gray-600 mt-1">
          Cập nhật món ăn và các chương trình khuyến mãi
        </p>
      </div>

      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList>
          <TabsTrigger value="menu">Thực đơn</TabsTrigger>
          <TabsTrigger value="promotions">Khuyến mãi</TabsTrigger>
        </TabsList>

        {/* Menu Tab */}
        <TabsContent value="menu" className="space-y-6">
          <Button onClick={() => setShowAddMenuModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm món
          </Button>

          {/* Search & Filter */}
          <div>
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm món ăn..."
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-[#0056D2] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat === "all" ? "Tất cả" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => (
              <Card
                key={item.id}
                hover
                onClick={() => openEditModal(item)}
                className="overflow-hidden cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400"
                    }
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white px-4 py-2 bg-red-500 rounded-lg">
                        Tạm hết
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4>{item.name}</h4>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={item.available}
                        onCheckedChange={() =>
                          handleToggleAvailability(item.id)
                        }
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description || "Món ăn ngon tuyệt vời"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#0056D2]">
                      {item.price.toLocaleString()}đ
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMenuItem(item.id);
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredMenuItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy món ăn phù hợp</p>
            </div>
          )}
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-6">
          <Button onClick={() => setShowAddPromoModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm khuyến mãi
          </Button>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Mã KM</th>
                    <th className="text-left p-4">Tên chương trình</th>
                    <th className="text-left p-4">Mã</th>
                    <th className="text-left p-4">Giảm giá</th>
                    <th className="text-left p-4">Số lượng</th>
                    <th className="text-left p-4">Thời gian</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => (
                    <tr key={promo.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-600">{promo.id}</td>
                      <td className="p-4">{promo.name}</td>
                      <td className="p-4">
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          {promo.code}
                        </code>
                      </td>
                      <td className="p-4">
                        {promo.discountType === "percentage"
                          ? `${promo.discountValue}%`
                          : `${promo.discountValue.toLocaleString()}đ`}
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            promo.promotionQuantity !== undefined &&
                            promo.promotionQuantity <= 0
                              ? "text-red-600"
                              : ""
                          }
                        >
                          {promo.promotionQuantity !== undefined
                            ? promo.promotionQuantity
                            : "Không giới hạn"}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <div>
                          <p>
                            {new Date(promo.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <p className="text-gray-600">
                            đến{" "}
                            {new Date(promo.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={
                            promo.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {promo.active ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Switch
                          checked={promo.active}
                          onCheckedChange={() =>
                            handleTogglePromotion(promo.id)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Menu Item Modal */}
      <Modal
        isOpen={showAddMenuModal}
        onClose={() => {
          setShowAddMenuModal(false);
          setMenuForm({
            name: "",
            category: "Món chính",
            price: 0,
            description: "",
            image: "",
          });
          setIngredientRows([{ ingredientId: "", quantity: 0 }]);
        }}
        title="Thêm món ăn mới"
      >
        <div className="space-y-4">
          {/* Ảnh món ăn */}
          <div>
            <label className="block mb-2 text-sm font-medium">Ảnh món ăn</label>
            {menuForm.image ? (
              <div className="relative group">
                <img
                  src={menuForm.image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setMenuForm({
                              ...menuForm,
                              image: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMenuForm({ ...menuForm, image: "" })}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setMenuForm({
                          ...menuForm,
                          image: reader.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <ImageIcon className="w-12 h-12" />
                  <p className="text-sm font-medium">Nhấn để chọn ảnh</p>
                  <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Tên món"
            value={menuForm.name}
            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
            placeholder="Nhập tên món"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Danh mục</label>
              <select
                value={menuForm.category}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {categories
                  .filter((cat) => cat !== "all")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
            <Input
              label="Giá (VNĐ)"
              type="number"
              value={menuForm.price || ""}
              onChange={(e) =>
                setMenuForm({
                  ...menuForm,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Nhập giá"
              min="0.01"
              step="1000"
            />
          </div>
          <Textarea
            label="Mô tả"
            value={menuForm.description}
            onChange={(e) =>
              setMenuForm({ ...menuForm, description: e.target.value })
            }
            placeholder="Nhập mô tả món ăn..."
            rows={3}
          />

          {/* Nguyên liệu */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block">Nguyên liệu</label>
              <Button size="sm" variant="secondary" onClick={addIngredientRow}>
                <Plus className="w-4 h-4 mr-1" />
                Thêm nguyên liệu
              </Button>
            </div>

            <div className="space-y-3">
              {ingredientRows.map((row, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <select
                      value={row.ingredientId}
                      onChange={(e) =>
                        updateIngredientRow(
                          index,
                          "ingredientId",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">-- Chọn nguyên liệu --</option>
                      {mockInventory.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.quantity}{" "}
                          {ingredient.unit} trong kho)
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="SL"
                    value={row.quantity || ""}
                    onChange={(e) =>
                      updateIngredientRow(
                        index,
                        "quantity",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0.01"
                    step="0.1"
                  />
                  {row.ingredientId && (
                    <div className="flex items-center px-2 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 whitespace-nowrap min-w-[50px] justify-center">
                      {mockInventory.find((inv) => inv.id === row.ingredientId)
                        ?.unit || ""}
                    </div>
                  )}
                  {ingredientRows.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIngredientRow(index)}
                      className="text-red-600 hover:bg-red-50 px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-8 mt-6 border-t">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowAddMenuModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleAddMenuItem}>
              Thêm món
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Promotion Modal */}
      <Modal
        isOpen={showAddPromoModal}
        onClose={() => setShowAddPromoModal(false)}
        title="Thêm khuyến mãi mới"
      >
        <div className="space-y-4">
          <Input
            label="Tên chương trình"
            value={promoForm.name}
            onChange={(e) =>
              setPromoForm({ ...promoForm, name: e.target.value })
            }
            placeholder="VD: Giảm giá mùa đông"
          />
          <Input
            label="Mã khuyến mãi"
            value={promoForm.code}
            onChange={(e) =>
              setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })
            }
            placeholder="VD: WINTER2025"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Loại giảm giá</label>
              <select
                value={promoForm.discountType}
                onChange={(e) =>
                  setPromoForm({
                    ...promoForm,
                    discountType: e.target.value as "percentage" | "fixed",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <Input
              label={
                promoForm.discountType === "percentage"
                  ? "Giá trị (%)"
                  : "Giá trị (VNĐ)"
              }
              type="number"
              value={promoForm.discountValue || ""}
              onChange={(e) =>
                setPromoForm({
                  ...promoForm,
                  discountValue: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Nhập giá trị"
              min="0.01"
              max={promoForm.discountType === "percentage" ? "100" : undefined}
              step={promoForm.discountType === "percentage" ? "0.1" : "1000"}
            />
          </div>
          <Input
            label="Số lượng lượt dùng"
            type="number"
            value={promoForm.promotionQuantity || ""}
            onChange={(e) =>
              setPromoForm({
                ...promoForm,
                promotionQuantity: parseInt(e.target.value) || 0,
              })
            }
            placeholder="Nhập số lượng (để trống = không giới hạn)"
            min="0"
            step="1"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={promoForm.startDate}
              onChange={(e) =>
                setPromoForm({ ...promoForm, startDate: e.target.value })
              }
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={promoForm.endDate}
              onChange={(e) =>
                setPromoForm({ ...promoForm, endDate: e.target.value })
              }
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowAddPromoModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleAddPromotion}>
              Thêm khuyến mãi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dish Detail Modal */}
      <Modal
        isOpen={selectedDish !== null}
        onClose={() => setSelectedDish(null)}
        title={selectedDish?.name || ""}
        size="xl"
      >
        {selectedDish && (
          <div className="space-y-6">
            {/* Ảnh ở trên */}
            <div>
              <img
                src={
                  selectedDish.image ||
                  "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=800"
                }
                alt={selectedDish.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Thông tin ở dưới */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-lg">
                  {selectedDish.description || "Món ăn ngon tuyệt vời"}
                </p>
                <Switch
                  checked={selectedDish.available}
                  onCheckedChange={() =>
                    handleToggleAvailability(selectedDish.id)
                  }
                />
              </div>

              {selectedDish.ingredients &&
                selectedDish.ingredients.length > 0 && (
                  <div>
                    <p className="font-medium text-lg mb-3">Thành phần:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDish.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-gray-100 rounded-full text-sm"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-600 text-lg">Giá:</span>
                <span className="text-3xl text-[#0056D2] font-medium">
                  {selectedDish.price.toLocaleString()}đ
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-600 text-lg">Danh mục:</span>
                <span className="text-lg font-medium">
                  {selectedDish.category}
                </span>
              </div>

              {!selectedDish.available && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-red-700 font-medium">
                    Món ăn đang tạm ngưng phục vụ
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn xóa món ăn này?")) {
                      handleDeleteMenuItem(selectedDish.id);
                      setSelectedDish(null);
                    }
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa món
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Menu Item Modal */}
      <Modal
        isOpen={showEditMenuModal}
        onClose={() => {
          setShowEditMenuModal(false);
          setEditingDish(null);
          setMenuForm({
            name: "",
            category: "Món chính",
            price: 0,
            description: "",
            image: "",
          });
          setIngredientRows([{ ingredientId: "", quantity: 0 }]);
        }}
        title="Chỉnh sửa món ăn"
      >
        <div className="space-y-4">
          {/* Ảnh món ăn */}
          <div>
            <label className="block mb-2 text-sm font-medium">Ảnh món ăn</label>
            {menuForm.image ? (
              <div className="relative group">
                <img
                  src={menuForm.image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setMenuForm({
                              ...menuForm,
                              image: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMenuForm({ ...menuForm, image: "" })}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setMenuForm({
                          ...menuForm,
                          image: reader.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <ImageIcon className="w-12 h-12" />
                  <p className="text-sm font-medium">Nhấn để chọn ảnh</p>
                  <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Tên món"
            value={menuForm.name}
            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
            placeholder="Nhập tên món"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Danh mục</label>
              <select
                value={menuForm.category}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {categories
                  .filter((cat) => cat !== "all")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
            <Input
              label="Giá (VNĐ)"
              type="number"
              value={menuForm.price || ""}
              onChange={(e) =>
                setMenuForm({
                  ...menuForm,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Nhập giá"
              min="0"
              step="1000"
            />
          </div>
          <Textarea
            label="Mô tả"
            value={menuForm.description}
            onChange={(e) =>
              setMenuForm({ ...menuForm, description: e.target.value })
            }
            placeholder="Nhập mô tả món ăn..."
            rows={3}
          />

          {/* Nguyên liệu */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block">Nguyên liệu</label>
              <Button size="sm" variant="secondary" onClick={addIngredientRow}>
                <Plus className="w-4 h-4 mr-1" />
                Thêm nguyên liệu
              </Button>
            </div>

            <div className="space-y-3">
              {ingredientRows.map((row, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <select
                      value={row.ingredientId}
                      onChange={(e) =>
                        updateIngredientRow(
                          index,
                          "ingredientId",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">-- Chọn nguyên liệu --</option>
                      {mockInventory.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.quantity}{" "}
                          {ingredient.unit} trong kho)
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="SL"
                    value={row.quantity || ""}
                    onChange={(e) =>
                      updateIngredientRow(
                        index,
                        "quantity",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                    step="0.1"
                  />
                  {row.ingredientId && (
                    <div className="flex items-center px-2 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 whitespace-nowrap min-w-[50px] justify-center">
                      {mockInventory.find((inv) => inv.id === row.ingredientId)
                        ?.unit || ""}
                    </div>
                  )}
                  {ingredientRows.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIngredientRow(index)}
                      className="text-red-600 hover:bg-red-50 px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-8 mt-6 border-t">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowEditMenuModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleEditMenuItem}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
