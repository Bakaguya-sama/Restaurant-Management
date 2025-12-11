import React, { useState } from "react";
import { Plus, Edit, Trash2, Power } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Textarea } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Switch } from "../../ui/switch";
import { mockMenuItems, mockPromotions } from "../../../lib/mockData";
import { MenuItem, Promotion } from "../../../types";
import { toast } from "sonner";

export function MenuPromotionPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "Món chính",
    price: 0,
    description: "",
  });
  const [promoForm, setPromoForm] = useState({
    name: "",
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    startDate: "",
    endDate: "",
  });

  const handleAddMenuItem = () => {
    if (!menuForm.name || menuForm.price <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const newItem: MenuItem = {
      id: String(menuItems.length + 1),
      name: menuForm.name,
      category: menuForm.category,
      price: menuForm.price,
      description: menuForm.description,
      available: true,
      image:
        "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400",
    };

    setMenuItems([...menuItems, newItem]);
    toast.success("Thêm món ăn thành công!");
    setShowAddMenuModal(false);
    setMenuForm({ name: "", category: "Món chính", price: 0, description: "" });
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const handleDeleteMenuItem = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa món ăn này?")) {
      setMenuItems(menuItems.filter((item) => item.id !== id));
      toast.success("Đã xóa món ăn");
    }
  };

  const handleAddPromotion = () => {
    if (!promoForm.name || !promoForm.code || promoForm.discountValue <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const newPromo: Promotion = {
      id: `PROMO${String(promotions.length + 1).padStart(3, "0")}`,
      name: promoForm.name,
      code: promoForm.code,
      discountType: promoForm.discountType,
      discountValue: promoForm.discountValue,
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

  const categories = ["Khai vị", "Món chính", "Đồ uống", "Tráng miệng"];

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

          {/* Menu by Category */}
          {categories.map((category) => {
            const categoryItems = menuItems.filter(
              (item) => item.category === category
            );
            if (categoryItems.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400"
                        }
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4>{item.name}</h4>
                          <Switch
                            checked={item.available}
                            onCheckedChange={() =>
                              handleToggleAvailability(item.id)
                            }
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description || "Chưa có mô tả"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[#0056D2]">
                            {item.price.toLocaleString()}đ
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDeleteMenuItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        {!item.available && (
                          <Badge className="mt-2 bg-gray-100 text-gray-700">
                            Tạm ngưng phục vụ
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
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
        onClose={() => setShowAddMenuModal(false)}
        title="Thêm món ăn mới"
      >
        <div className="space-y-4">
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
                {categories.map((cat) => (
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
          <div className="flex gap-4 pt-4">
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
            />
          </div>
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
    </div>
  );
}
