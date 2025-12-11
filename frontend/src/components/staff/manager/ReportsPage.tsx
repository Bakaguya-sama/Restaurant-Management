import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Utensils,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function ReportsPage() {
  const [dateRange, setDateRange] = useState("week");
  const [reportType, setReportType] = useState("overview");

  // Revenue data
  const revenueData = [
    { date: "04/12", revenue: 12500000, orders: 45, customers: 38 },
    { date: "05/12", revenue: 15200000, orders: 52, customers: 42 },
    { date: "06/12", revenue: 10800000, orders: 38, customers: 32 },
    { date: "07/12", revenue: 18400000, orders: 65, customers: 55 },
    { date: "08/12", revenue: 22100000, orders: 78, customers: 68 },
    { date: "09/12", revenue: 28500000, orders: 95, customers: 82 },
    { date: "10/12", revenue: 25300000, orders: 89, customers: 75 },
  ];

  // Top selling dishes
  const topDishes = [
    { name: "Phở Bò", sold: 245, revenue: 20825000, growth: 12 },
    { name: "Bún Chả", sold: 198, revenue: 14850000, growth: 8 },
    { name: "Cơm Gà", sold: 167, revenue: 10855000, growth: -3 },
    { name: "Gỏi Cuốn", sold: 156, revenue: 7020000, growth: 15 },
    { name: "Trà Chanh", sold: 312, revenue: 6240000, growth: 22 },
    { name: "Sinh Tố Bơ", sold: 189, revenue: 6615000, growth: 5 },
  ];

  // Staff performance
  const staffPerformance = [
    {
      name: "Nguyễn Văn A",
      role: "Waiter",
      orders: 156,
      revenue: 28500000,
      rating: 4.8,
    },
    {
      name: "Trần Thị B",
      role: "Waiter",
      orders: 142,
      revenue: 25200000,
      rating: 4.7,
    },
    {
      name: "Lê Văn C",
      role: "Waiter",
      orders: 128,
      revenue: 22800000,
      rating: 4.6,
    },
    {
      name: "Phạm Thị D",
      role: "Cashier",
      orders: 289,
      revenue: 52100000,
      rating: 4.9,
    },
    {
      name: "Hoàng Văn E",
      role: "Cashier",
      orders: 267,
      revenue: 48300000,
      rating: 4.7,
    },
  ];

  // Customer statistics
  const customerStats = [
    { tier: "VIP", count: 45, revenue: 35200000, percentage: 28 },
    { tier: "Gold", count: 128, revenue: 52800000, percentage: 42 },
    { tier: "Silver", count: 234, revenue: 28400000, percentage: 23 },
    { tier: "Bronze", count: 189, revenue: 8900000, percentage: 7 },
  ];

  // Inventory alerts
  const inventoryAlerts = [
    { item: "Thịt bò", current: 8, min: 15, status: "critical" },
    { item: "Bánh phở", current: 18, min: 20, status: "warning" },
    { item: "Rau sống", current: 3, min: 10, status: "critical" },
    { item: "Tôm tươi", current: 12, min: 15, status: "warning" },
  ];

  // Payment methods distribution
  const paymentData = [
    { name: "Tiền mặt", value: 45, amount: 56800000 },
    { name: "Thẻ", value: 32, amount: 40500000 },
    { name: "Ví điện tử", value: 23, amount: 29000000 },
  ];

  // Peak hours
  const peakHoursData = [
    { hour: "06:00", orders: 12 },
    { hour: "07:00", orders: 25 },
    { hour: "08:00", orders: 18 },
    { hour: "09:00", orders: 8 },
    { hour: "10:00", orders: 5 },
    { hour: "11:00", orders: 28 },
    { hour: "12:00", orders: 52 },
    { hour: "13:00", orders: 45 },
    { hour: "14:00", orders: 22 },
    { hour: "15:00", orders: 12 },
    { hour: "16:00", orders: 15 },
    { hour: "17:00", orders: 35 },
    { hour: "18:00", orders: 68 },
    { hour: "19:00", orders: 85 },
    { hour: "20:00", orders: 72 },
    { hour: "21:00", orders: 45 },
  ];

  const COLORS = ["#0056D2", "#10B981", "#F59E0B", "#EF4444"];

  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = revenueData.reduce((sum, day) => sum + day.orders, 0);
  const totalCustomers = revenueData.reduce(
    (sum, day) => sum + day.customers,
    0
  );
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2>Báo cáo & Thống kê</h2>
          <p className="text-gray-600 mt-1">
            Phân tích chi tiết hoạt động kinh doanh
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
          </select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Tổng quan" },
          { id: "revenue", label: "Doanh thu" },
          { id: "products", label: "Món ăn" },
          { id: "staff", label: "Nhân viên" },
          { id: "customers", label: "Khách hàng" },
          { id: "inventory", label: "Kho" },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              reportType === type.id
                ? "bg-[#0056D2] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {reportType === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Tổng doanh thu</p>
              <p className="text-2xl">{totalRevenue.toLocaleString()}đ</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600">+8.3%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Tổng đơn hàng</p>
              <p className="text-2xl">{totalOrders}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600">+15.2%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Khách hàng</p>
              <p className="text-2xl">{totalCustomers}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600">+5.7%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Giá trị TB/đơn</p>
              <p className="text-2xl">{avgOrderValue.toLocaleString()}đ</p>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card className="p-6">
            <h3 className="mb-6">Xu hướng doanh thu</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0056D2"
                  strokeWidth={2}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <Card className="p-6">
              <h3 className="mb-6">Phương thức thanh toán</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Peak Hours */}
            <Card className="p-6">
              <h3 className="mb-6">Giờ cao điểm</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#10B981" name="Đơn hàng" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {reportType === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <p className="text-gray-600 mb-2">Doanh thu thuần</p>
              <p className="text-3xl text-[#0056D2] mb-2">
                {totalRevenue.toLocaleString()}đ
              </p>
              <p className="text-sm text-green-600">+12.5% so với tuần trước</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 mb-2">Chi phí vận hành</p>
              <p className="text-3xl text-orange-600 mb-2">45.200.000đ</p>
              <p className="text-sm text-gray-600">35.8% doanh thu</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 mb-2">Lợi nhuận ròng</p>
              <p className="text-3xl text-green-600 mb-2">81.100.000đ</p>
              <p className="text-sm text-green-600">64.2% doanh thu</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-6">Biểu đồ doanh thu chi tiết</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0056D2"
                  strokeWidth={2}
                  name="Doanh thu"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Số đơn"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Chi tiết doanh thu theo ngày</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Ngày</th>
                    <th className="text-right py-3 px-4">Doanh thu</th>
                    <th className="text-right py-3 px-4">Đơn hàng</th>
                    <th className="text-right py-3 px-4">Khách</th>
                    <th className="text-right py-3 px-4">TB/Đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((day, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{day.date}</td>
                      <td className="text-right py-3 px-4 text-[#0056D2]">
                        {day.revenue.toLocaleString()}đ
                      </td>
                      <td className="text-right py-3 px-4">{day.orders}</td>
                      <td className="text-right py-3 px-4">{day.customers}</td>
                      <td className="text-right py-3 px-4">
                        {(day.revenue / day.orders).toLocaleString()}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Products Report */}
      {reportType === "products" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Top món bán chạy</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDishes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sold" fill="#0056D2" name="Số lượng bán" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Chi tiết món ăn</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Tên món</th>
                    <th className="text-right py-3 px-4">Đã bán</th>
                    <th className="text-right py-3 px-4">Doanh thu</th>
                    <th className="text-right py-3 px-4">Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {topDishes.map((dish, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{dish.name}</td>
                      <td className="text-right py-3 px-4">{dish.sold}</td>
                      <td className="text-right py-3 px-4 text-[#0056D2]">
                        {dish.revenue.toLocaleString()}đ
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={
                            dish.growth >= 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {dish.growth >= 0 ? "+" : ""}
                          {dish.growth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Staff Report */}
      {reportType === "staff" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Hiệu suất nhân viên</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nhân viên</th>
                    <th className="text-left py-3 px-4">Vai trò</th>
                    <th className="text-right py-3 px-4">Đơn hàng</th>
                    <th className="text-right py-3 px-4">Doanh thu</th>
                    <th className="text-right py-3 px-4">Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerformance.map((staff, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{staff.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {staff.role}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">{staff.orders}</td>
                      <td className="text-right py-3 px-4 text-[#0056D2]">
                        {staff.revenue.toLocaleString()}đ
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{staff.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Doanh thu theo nhân viên</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10B981" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Customers Report */}
      {reportType === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {customerStats.map((tier, index) => (
              <Card key={index} className="p-6">
                <p className="text-gray-600 mb-2">{tier.tier}</p>
                <p className="text-3xl mb-2">{tier.count}</p>
                <p className="text-sm text-[#0056D2] mb-1">
                  {tier.revenue.toLocaleString()}đ
                </p>
                <p className="text-sm text-gray-600">
                  {tier.percentage}% tổng doanh thu
                </p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="mb-6">Phân bố khách hàng theo hạng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.tier}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {customerStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Thống kê khách hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600 mb-1">Khách mới</p>
                <p className="text-2xl text-[#0056D2]">128</p>
                <p className="text-sm text-gray-600">+18% so với tuần trước</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 mb-1">Khách quay lại</p>
                <p className="text-2xl text-green-600">467</p>
                <p className="text-sm text-gray-600">78.5% tổng khách</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-600 mb-1">Tích điểm TB</p>
                <p className="text-2xl text-purple-600">850</p>
                <p className="text-sm text-gray-600">điểm/khách hàng</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Inventory Report */}
      {reportType === "inventory" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Cảnh báo tồn kho</h3>
            <div className="space-y-3">
              {inventoryAlerts.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    item.status === "critical"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle
                        className={`w-5 h-5 ${
                          item.status === "critical"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      />
                      <div>
                        <p className="mb-1">{item.item}</p>
                        <p className="text-sm text-gray-600">
                          Hiện có: {item.current}kg - Tối thiểu: {item.min}kg
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        item.status === "critical"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status === "critical" ? "Nghiêm trọng" : "Cảnh báo"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <p className="text-gray-600 mb-2">Tổng giá trị kho</p>
              <p className="text-3xl text-[#0056D2] mb-2">145.800.000đ</p>
              <p className="text-sm text-gray-600">234 mặt hàng</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 mb-2">Sắp hết hạn</p>
              <p className="text-3xl text-orange-600 mb-2">12</p>
              <p className="text-sm text-gray-600">Trong 7 ngày tới</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 mb-2">Cần bổ sung</p>
              <p className="text-3xl text-red-600 mb-2">8</p>
              <p className="text-sm text-gray-600">Dưới mức tối thiểu</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
