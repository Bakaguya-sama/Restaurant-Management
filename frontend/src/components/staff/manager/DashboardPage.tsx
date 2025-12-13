import React, { useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Users,
  Package,
  Download,
  Utensils,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/badge";

export function ManagerDashboard() {
  const [dateRange, setDateRange] = useState("week");

  // Mock data theo time range
  const getDataByRange = () => {
    const dataByRange = {
      today: {
        invoices: {
          count: 45,
          revenue: 22500000,
          list: [
            {
              id: "HD001",
              date: "2025-12-13 08:30",
              customer: "Nguyễn Văn A",
              items: 8,
              total: 850000,
              status: "paid",
            },
            {
              id: "HD002",
              date: "2025-12-13 09:15",
              customer: "Trần Thị B",
              items: 5,
              total: 650000,
              status: "paid",
            },
            {
              id: "HD003",
              date: "2025-12-13 10:00",
              customer: "Lê Văn C",
              items: 12,
              total: 1200000,
              status: "paid",
            },
            {
              id: "HD004",
              date: "2025-12-13 11:30",
              customer: "Phạm Thị D",
              items: 4,
              total: 450000,
              status: "paid",
            },
            {
              id: "HD005",
              date: "2025-12-13 12:00",
              customer: "Hoàng Văn E",
              items: 9,
              total: 980000,
              status: "paid",
            },
          ],
        },
        damagedItems: [
          {
            name: "Rau xanh",
            quantity: 2,
            value: 50000,
            date: "2025-12-13",
            reason: "Hư hỏng",
          },
        ],
        topDishes: [
          { name: "Phở Bò", sold: 32, revenue: 2720000 },
          { name: "Bún Chả", sold: 28, revenue: 2100000 },
          { name: "Cơm Gà", sold: 25, revenue: 1625000 },
          { name: "Gỏi Cuốn", sold: 18, revenue: 810000 },
          { name: "Bánh Mì", sold: 15, revenue: 525000 },
        ],
        lowDishes: [
          { name: "Canh Chua", sold: 2, revenue: 140000 },
          { name: "Lẩu Thái", sold: 3, revenue: 390000 },
        ],
        bookings: { count: 32, guests: 128 },
        newCustomers: 12,
      },
      week: {
        invoices: {
          count: 328,
          revenue: 164000000,
          list: [
            {
              id: "HD045",
              date: "2025-12-13 08:30",
              customer: "Nguyễn Văn A",
              items: 8,
              total: 850000,
              status: "paid",
            },
            {
              id: "HD044",
              date: "2025-12-12 19:15",
              customer: "Trần Thị B",
              items: 5,
              total: 650000,
              status: "paid",
            },
            {
              id: "HD043",
              date: "2025-12-12 18:00",
              customer: "Lê Văn C",
              items: 12,
              total: 1200000,
              status: "paid",
            },
            {
              id: "HD042",
              date: "2025-12-11 12:30",
              customer: "Phạm Thị D",
              items: 4,
              total: 450000,
              status: "paid",
            },
            {
              id: "HD041",
              date: "2025-12-10 11:00",
              customer: "Hoàng Văn E",
              items: 9,
              total: 980000,
              status: "paid",
            },
          ],
        },
        damagedItems: [
          {
            name: "Thịt gà",
            quantity: 8,
            value: 560000,
            date: "2025-12-10",
            reason: "Hết hạn",
          },
          {
            name: "Rau xanh",
            quantity: 5,
            value: 125000,
            date: "2025-12-09",
            reason: "Hư hỏng",
          },
          {
            name: "Sữa chua",
            quantity: 15,
            value: 450000,
            date: "2025-12-08",
            reason: "Hết hạn",
          },
        ],
        topDishes: [
          { name: "Phở Bò", sold: 245, revenue: 20825000 },
          { name: "Bún Chả", sold: 198, revenue: 14850000 },
          { name: "Cơm Gà", sold: 167, revenue: 10855000 },
          { name: "Gỏi Cuốn", sold: 156, revenue: 7020000 },
          { name: "Bánh Mì", sold: 134, revenue: 4690000 },
        ],
        lowDishes: [
          { name: "Canh Chua", sold: 12, revenue: 840000 },
          { name: "Lẩu Thái", sold: 18, revenue: 2340000 },
          { name: "Mì Xào", sold: 23, revenue: 1610000 },
        ],
        bookings: { count: 245, guests: 980 },
        newCustomers: 84,
      },
      month: {
        invoices: {
          count: 1456,
          revenue: 728000000,
          list: [
            {
              id: "HD456",
              date: "2025-12-13 08:30",
              customer: "Nguyễn Văn A",
              items: 8,
              total: 850000,
              status: "paid",
            },
            {
              id: "HD455",
              date: "2025-12-12 19:15",
              customer: "Trần Thị B",
              items: 5,
              total: 650000,
              status: "paid",
            },
            {
              id: "HD454",
              date: "2025-12-11 18:00",
              customer: "Lê Văn C",
              items: 12,
              total: 1200000,
              status: "paid",
            },
            {
              id: "HD453",
              date: "2025-12-10 12:30",
              customer: "Phạm Thị D",
              items: 4,
              total: 450000,
              status: "paid",
            },
            {
              id: "HD452",
              date: "2025-12-09 11:00",
              customer: "Hoàng Văn E",
              items: 9,
              total: 980000,
              status: "paid",
            },
          ],
        },
        damagedItems: [
          {
            name: "Thịt gà",
            quantity: 35,
            value: 2450000,
            date: "2025-12-10",
            reason: "Hết hạn",
          },
          {
            name: "Rau xanh",
            quantity: 28,
            value: 700000,
            date: "2025-12-09",
            reason: "Hư hỏng",
          },
          {
            name: "Sữa chua",
            quantity: 62,
            value: 1860000,
            date: "2025-12-08",
            reason: "Hết hạn",
          },
          {
            name: "Tôm tươi",
            quantity: 18,
            value: 2340000,
            date: "2025-12-05",
            reason: "Hết hạn",
          },
        ],
        topDishes: [
          { name: "Phở Bò", sold: 1089, revenue: 92565000 },
          { name: "Bún Chả", sold: 892, revenue: 66900000 },
          { name: "Cơm Gà", sold: 745, revenue: 48425000 },
          { name: "Gỏi Cuốn", sold: 678, revenue: 30510000 },
          { name: "Bánh Mì", sold: 589, revenue: 20615000 },
        ],
        lowDishes: [
          { name: "Canh Chua", sold: 45, revenue: 3150000 },
          { name: "Lẩu Thái", sold: 67, revenue: 8710000 },
          { name: "Mì Xào", sold: 89, revenue: 6230000 },
        ],
        bookings: { count: 1089, guests: 4356 },
        newCustomers: 356,
      },
    };

    return dataByRange[dateRange as keyof typeof dataByRange];
  };

  const currentData = getDataByRange();

  // Báo cáo kho nguyên liệu (không đổi theo time range)
  const inventoryAlerts = [
    {
      name: "Thịt bò",
      current: 8,
      minimum: 15,
      expiryDate: "2026-01-20",
      status: "low",
    },
    {
      name: "Rau sống",
      current: 3,
      minimum: 10,
      expiryDate: "2025-12-18",
      status: "low",
    },
    {
      name: "Tôm tươi",
      current: 12,
      minimum: 15,
      expiryDate: "2025-12-15",
      status: "expiring",
    },
    {
      name: "Sữa tươi",
      current: 5,
      minimum: 10,
      expiryDate: "2025-12-14",
      status: "expiring",
    },
  ];

  // Báo cáo khách hàng (không đổi theo time range)
  const customerStats = {
    vip: 45,
    new: currentData.newCustomers,
    returning: 467,
    avgSpending: 850000,
  };

  const customerSegments = [
    { tier: "Kim cương", count: 45, revenue: 35100000, percentage: 28 },
    { tier: "Bạch kim", count: 82, revenue: 28200000, percentage: 22 },
    { tier: "Vàng", count: 128, revenue: 52800000, percentage: 42 },
    { tier: "Bạc", count: 234, revenue: 28400000, percentage: 23 },
    { tier: "Đồng", count: 156, revenue: 18900000, percentage: 15 },
  ];

  // Báo cáo phản hồi (5 phản hồi gần nhất)
  const recentFeedback = [
    {
      customer: "Nguyễn Văn An",
      comment:
        "Món ăn rất ngon, phục vụ tận tình. Đặc biệt là phở bò rất đúng vị.",
      date: "2025-12-12",
    },
    {
      customer: "Trần Thị Bình",
      comment:
        "Không gian đẹp, nhưng thời gian chờ hơi lâu. Nên cải thiện tốc độ phục vụ.",
      date: "2025-12-11",
    },
    {
      customer: "Lê Văn Cường",
      comment: "Sẽ quay lại lần sau. Nhân viên nhiệt tình, thân thiện.",
      date: "2025-12-11",
    },
    {
      customer: "Phạm Thị Dung",
      comment: "Món ăn ổn nhưng giá hơi cao so với mặt bằng chung.",
      date: "2025-12-10",
    },
    {
      customer: "Hoàng Minh Tuấn",
      comment: "Đồ ăn ngon, không gian sạch sẽ. Sẽ giới thiệu cho bạn bè.",
      date: "2025-12-09",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-orange-100 text-orange-700";
      case "expiring":
        return "bg-yellow-100 text-yellow-700";
      case "expired":
        return "bg-red-100 text-red-700";
      case "paid":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "low":
        return "Sắp hết";
      case "expiring":
        return "Sắp hết hạn";
      case "expired":
        return "Hết hạn";
      case "paid":
        return "Đã thanh toán";
      default:
        return status;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2>Dashboard & Báo cáo</h2>
          <p className="text-gray-600 mt-1">
            Tổng quan hoạt động kinh doanh nhà hàng
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg h-10"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Báo cáo xem kho nguyên liệu (cảnh báo) */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3>Báo cáo kho nguyên liệu - Cảnh báo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nguyên liệu</th>
                  <th className="text-right py-3 px-4">Số lượng hiện tại</th>
                  <th className="text-right py-3 px-4">Mức tối thiểu</th>
                  <th className="text-right py-3 px-4">Ngày hết hạn</th>
                  <th className="text-center py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {inventoryAlerts.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="text-right py-3 px-4">{item.current} kg</td>
                    <td className="text-right py-3 px-4">{item.minimum} kg</td>
                    <td className="text-right py-3 px-4">{item.expiryDate}</td>
                    <td className="text-center py-3 px-4">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 2. Báo cáo nguyên liệu bị hỏng/hết hạn */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-red-600" />
            <h3>Báo cáo nguyên liệu bị hỏng/hết hạn trong kỳ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nguyên liệu</th>
                  <th className="text-right py-3 px-4">Số lượng</th>
                  <th className="text-right py-3 px-4">Giá trị</th>
                  <th className="text-right py-3 px-4">Ngày loại bỏ</th>
                  <th className="text-center py-3 px-4">Lý do</th>
                </tr>
              </thead>
              <tbody>
                {currentData.damagedItems.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="text-right py-3 px-4">{item.quantity} kg</td>
                    <td className="text-right py-3 px-4 text-red-600">
                      {item.value.toLocaleString()}đ
                    </td>
                    <td className="text-right py-3 px-4">{item.date}</td>
                    <td className="text-center py-3 px-4">
                      <Badge
                        className={
                          item.reason === "Hết hạn"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {item.reason}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 3. Báo cáo hóa đơn bán hàng */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3>Báo cáo hóa đơn bán hàng/phiếu gọi món</h3>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">
                {dateRange === "today"
                  ? "Hôm nay"
                  : dateRange === "week"
                  ? "Tuần này"
                  : "Tháng này"}
              </p>
              <p className="text-2xl text-[#0056D2] mb-1">
                {currentData.invoices.count} đơn
              </p>
              <p className="text-sm text-gray-700">
                {currentData.invoices.revenue.toLocaleString()}đ
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Tổng món đã bán</p>
              <p className="text-2xl text-green-600 mb-1">
                {currentData.topDishes.reduce(
                  (sum, dish) => sum + dish.sold,
                  0
                )}
              </p>
              <p className="text-sm text-gray-700">
                {currentData.topDishes
                  .reduce((sum, dish) => sum + dish.revenue, 0)
                  .toLocaleString()}
                đ
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Khách hàng mới</p>
              <p className="text-2xl text-purple-600 mb-1">
                {currentData.newCustomers}
              </p>
              <p className="text-sm text-gray-700">Trong kỳ này</p>
            </div>
          </div>

          {/* Recent Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Mã HĐ</th>
                  <th className="text-left py-3 px-4">Ngày</th>
                  <th className="text-left py-3 px-4">Khách hàng</th>
                  <th className="text-right py-3 px-4">Số lượng món</th>
                  <th className="text-right py-3 px-4">Tổng tiền</th>
                  <th className="text-center py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentData.invoices.list.map((invoice, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{invoice.id}</td>
                    <td className="py-3 px-4">{invoice.date}</td>
                    <td className="py-3 px-4">{invoice.customer}</td>
                    <td className="text-right py-3 px-4">{invoice.items}</td>
                    <td className="text-right py-3 px-4 text-green-600">
                      {invoice.total.toLocaleString()}đ
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 4. Báo cáo thống kê món ăn */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-blue-600" />
            <h3>Báo cáo thống kê món ăn</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling */}
            <div>
              <h4 className="mb-3 text-green-600">Món bán chạy nhất</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Món ăn</th>
                      <th className="text-right py-2 px-3">Đã bán</th>
                      <th className="text-right py-2 px-3">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.topDishes.map((dish, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{dish.name}</td>
                        <td className="text-right py-2 px-3">{dish.sold}</td>
                        <td className="text-right py-2 px-3 text-green-600">
                          {dish.revenue.toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Selling */}
            <div>
              <h4 className="mb-3 text-red-600">Món bán chậm</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Món ăn</th>
                      <th className="text-right py-2 px-3">Đã bán</th>
                      <th className="text-right py-2 px-3">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.lowDishes.map((dish, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{dish.name}</td>
                        <td className="text-right py-2 px-3">{dish.sold}</td>
                        <td className="text-right py-2 px-3 text-red-600">
                          {dish.revenue.toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        {/* 5. Báo cáo thống kê khách hàng */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3>Báo cáo thống kê khách hàng</h3>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Khách VIP</p>
              <p className="text-2xl text-yellow-600">{customerStats.vip}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Khách mới</p>
              <p className="text-2xl text-blue-600">{customerStats.new}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Khách quay lại</p>
              <p className="text-2xl text-green-600">
                {customerStats.returning}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Chi tiêu TB</p>
              <p className="text-2xl text-purple-600">
                {customerStats.avgSpending.toLocaleString()}đ
              </p>
            </div>
          </div>

          {/* Customer Segments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Hạng</th>
                  <th className="text-right py-3 px-4">Số lượng</th>
                  <th className="text-right py-3 px-4">Doanh thu</th>
                  <th className="text-right py-3 px-4">% Tổng DT</th>
                </tr>
              </thead>
              <tbody>
                {customerSegments.map((segment, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          segment.tier === "Diamond"
                            ? "bg-blue-100 text-blue-700"
                            : segment.tier === "Platinum"
                            ? "bg-purple-100 text-purple-700"
                            : segment.tier === "Gold"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {segment.tier}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">{segment.count}</td>
                    <td className="text-right py-3 px-4 text-[#0056D2]">
                      {segment.revenue.toLocaleString()}đ
                    </td>
                    <td className="text-right py-3 px-4">
                      {segment.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 6. Báo cáo đặt bàn */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3>Báo cáo số lượt đặt bàn và số lượng khách</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Đặt bàn trong kỳ</p>
              <p className="text-2xl text-indigo-600 mb-1">
                {currentData.bookings.count} lượt
              </p>
              <p className="text-sm text-gray-700">
                {currentData.bookings.guests} khách
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">TB khách/đặt bàn</p>
              <p className="text-2xl text-blue-600 mb-1">
                {Math.round(
                  currentData.bookings.guests / currentData.bookings.count
                )}{" "}
                khách
              </p>
              <p className="text-sm text-gray-700">Trung bình</p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Tổng doanh thu</p>
              <p className="text-2xl text-cyan-600">
                {currentData.invoices.revenue.toLocaleString()}đ
              </p>
            </div>
          </div>
        </Card>

        {/* 7. Báo cáo phản hồi */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3>Báo cáo phản hồi khách hàng</h3>
          </div>

          {/* Recent Feedback - 5 phản hồi gần nhất */}
          <h4 className="mb-3">5 phản hồi gần nhất</h4>
          <div className="space-y-3">
            {recentFeedback.map((feedback, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{feedback.customer}</p>
                  <p className="text-sm text-gray-600">{feedback.date}</p>
                </div>
                <p className="text-gray-700">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
