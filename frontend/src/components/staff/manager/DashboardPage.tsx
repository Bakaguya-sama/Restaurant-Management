import React from 'react';
import { TrendingUp, Users, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function ManagerDashboard() {
  const stats = [
    {
      label: 'Doanh thu hôm nay',
      value: '15.5M',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Khách hàng',
      value: '234',
      change: '+8.2%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Đơn hàng',
      value: '89',
      change: '+5.4%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'Tồn kho cảnh báo',
      value: '5',
      change: '-2',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  const revenueData = [
    { name: 'T2', revenue: 12 },
    { name: 'T3', revenue: 15 },
    { name: 'T4', revenue: 10 },
    { name: 'T5', revenue: 18 },
    { name: 'T6', revenue: 22 },
    { name: 'T7', revenue: 28 },
    { name: 'CN', revenue: 25 },
  ];

  const popularDishes = [
    { name: 'Phở Bò', orders: 45, revenue: 3825000 },
    { name: 'Bún Chả', orders: 38, revenue: 2850000 },
    { name: 'Cơm Gà', orders: 32, revenue: 2080000 },
    { name: 'Gỏi Cuốn', orders: 28, revenue: 1260000 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2>Tổng quan</h2>
        <p className="text-gray-600">Theo dõi hoạt động kinh doanh của nhà hàng</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="mb-6">Doanh thu tuần này</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#0056D2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-6">Món ăn bán chạy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={popularDishes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {[
              { time: '10:30', text: 'Đơn hàng mới tại bàn T05', type: 'order' },
              { time: '10:15', text: 'Nhập kho 25kg thịt bò', type: 'inventory' },
              { time: '09:45', text: 'Khách hàng mới đăng ký: Nguyễn Văn A', type: 'customer' },
              { time: '09:20', text: 'Thanh toán hóa đơn #INV123', type: 'payment' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <span className="text-sm text-gray-500">{activity.time}</span>
                <p className="text-sm flex-1">{activity.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Cảnh báo</h3>
          <div className="space-y-3">
            {[
              { text: 'Rau sống sắp hết hạn (12/12/2025)', type: 'warning' },
              { text: 'Bánh phở tồn kho thấp ({`<10kg`})', type: 'error' },
              { text: 'Bàn T08 cần bảo trì', type: 'info' },
            ].map((alert, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  alert.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <p className="text-sm">{alert.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
