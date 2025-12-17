import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Shield, Search } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { toast } from "sonner";
import {
  validateEmail,
  validateVietnamesePhone,
  validateRequired,
  validatePassword,
} from "../../../lib/validation";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { staffApi } from "../../../lib/api";

interface Employee {
  id: string;
  name: string;
  username: string;
  role: "manager" | "cashier" | "waiter";
  phone: string;
  email: string;
  status: "active" | "inactive";
}

const mockEmployees: Employee[] = [
  {
    id: "E001",
    name: "Nguyễn Văn A",
    username: "nguyenvana",
    role: "manager",
    phone: "0901234567",
    email: "nguyenvana@restaurant.com",
    status: "active",
  },
  {
    id: "E002",
    name: "Trần Thị B",
    username: "tranthib",
    role: "cashier",
    phone: "0902345678",
    email: "tranthib@restaurant.com",
    status: "active",
  },
  {
    id: "E003",
    name: "Lê Văn C",
    username: "levanc",
    role: "waiter",
    phone: "0903456789",
    email: "levanc@restaurant.com",
    status: "active",
  },
];

const availableRoles = [
  { id: "waiter", label: "Phục vụ", description: "Nhận order, quản lý bàn" },
  {
    id: "cashier",
    label: "Thu ngân",
    description: "Xử lý thanh toán, in hóa đơn",
  },
  { id: "manager", label: "Quản lý", description: "Quản lý toàn bộ hệ thống" },
];

export function HRPage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmCancelText, setConfirmCancelText] = useState("Hủy");
  const [confirmVariant, setConfirmVariant] = useState<
    "info" | "warning" | "danger"
  >("info");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "waiter" as Employee["role"],
    phone: "",
    email: "",
  });
  const [selectedRole, setSelectedRole] = useState<Employee["role"]>("waiter");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getAll();
      const transformedData = data.map((staff: any) => ({
        id: staff.id,
        name: staff.full_name,
        username: staff.username,
        role: staff.role,
        phone: staff.phone || '',
        email: staff.email || '',
        status: staff.status === 'active' ? 'active' : 'inactive',
      }));
      setEmployees(transformedData);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddEmployee = async () => {
    const nameValidation = validateRequired(formData.name, "Họ và tên");
    const usernameValidation = validateRequired(
      formData.username,
      "Tên đăng nhập"
    );
    const passwordValidation = validatePassword(formData.password);

    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    if (!usernameValidation.isValid) {
      toast.error(usernameValidation.error);
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error);
      return;
    }

    if (formData.phone) {
      const phoneValidation = validateVietnamesePhone(formData.phone);
      if (!phoneValidation.isValid) {
        toast.error(phoneValidation.error);
        return;
      }
    }

    if (formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.error);
        return;
      }
    }

    try {
      await staffApi.create({
        full_name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
      });
      
      await fetchEmployees();
      toast.success("Thêm nhân viên thành công!");
      setShowAddModal(false);
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "waiter",
        phone: "",
        email: "",
      });
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm nhân viên');
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setConfirmTitle(`Xóa nhân viên`);
    setConfirmMessage(`Bạn có chắc muốn xóa nhân viên này?`);
    setConfirmText("Xóa");
    setConfirmCancelText("Hủy");
    setConfirmVariant(`warning`);
    setPendingAction(() => async () => {
      try {
        await staffApi.delete(id);
        await fetchEmployees();
        toast.success("Đã xóa nhân viên");
      } catch (error: any) {
        toast.error(error.message || 'Không thể xóa nhân viên');
      }
    });
    setShowConfirmModal(true);
  };

  const handleOpenRole = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedRole(employee.role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedEmployee) return;

    try {
      await staffApi.update(selectedEmployee.id, { role: selectedRole });
      await fetchEmployees();
      toast.success("Cập nhật vai trò thành công!");
      setShowRoleModal(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật vai trò');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-purple-100 text-purple-700";
      case "cashier":
        return "bg-blue-100 text-blue-700";
      case "waiter":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "manager":
        return "Quản lý";
      case "cashier":
        return "Thu ngân";
      case "waiter":
        return "Phục vụ";
      default:
        return role;
    }
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>Quản lý nhân sự</h2>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin và quyền hạn của nhân viên
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Tổng nhân viên</p>
          <p className="text-3xl">{employees.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Quản lý</p>
          <p className="text-3xl">
            {employees.filter((e) => e.role === "manager").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Thu ngân</p>
          <p className="text-3xl">
            {employees.filter((e) => e.role === "cashier").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Phục vụ</p>
          <p className="text-3xl">
            {employees.filter((e) => e.role === "waiter").length}
          </p>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm nhân viên..."
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="w-48">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="manager">Quản lý</SelectItem>
              <SelectItem value="cashier">Thu ngân</SelectItem>
              <SelectItem value="waiter">Phục vụ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employee Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Họ tên</th>
                  <th className="text-left p-4">Username</th>
                  <th className="text-left p-4">Vai trò</th>
                  <th className="text-left p-4">Liên hệ</th>
                  <th className="text-left p-4">Trạng thái</th>
                  <th className="text-left p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b hover:bg-gray-50">
                  {/* <td className="p-4">{employee.id}</td> */}
                  <td className="p-4">{employee.name}</td>
                  <td className="p-4 text-gray-600">{employee.username}</td>
                  <td className="p-4">
                    <Badge className={getRoleColor(employee.role)}>
                      {getRoleText(employee.role)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p>{employee.phone}</p>
                      <p className="text-gray-600">{employee.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        employee.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {employee.status === "active"
                        ? "Hoạt động"
                        : "Ngừng hoạt động"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenRole(employee)}
                        title="Đổi vai trò"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm nhân viên mới"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập họ tên"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Nhập username"
            />
            <Input
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Nhập mật khẩu"
            />
          </div>
          <div>
            <label className="block mb-2">Vai trò</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as Employee["role"],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="waiter">Phục vụ</option>
              <option value="cashier">Thu ngân</option>
              <option value="manager">Quản lý</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Nhập số điện thoại"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Nhập email"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowAddModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleAddEmployee}>
              Thêm nhân viên
            </Button>
          </div>
        </div>
      </Modal>

      {/* Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={`Đổi vai trò - ${selectedEmployee?.name}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              Vai trò hiện tại:{" "}
              <span className="text-gray-900 font-medium">
                {selectedEmployee && getRoleText(selectedEmployee.role)}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            {availableRoles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                style={{
                  borderColor: selectedRole === role.id ? "#3b82f6" : "#e5e7eb",
                  backgroundColor:
                    selectedRole === role.id ? "#eff6ff" : "white",
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.id}
                  checked={selectedRole === role.id}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as Employee["role"])
                  }
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{role.label}</p>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowRoleModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleUpdateRole}>
              Cập nhật vai trò
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
