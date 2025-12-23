import React, { useState, useEffect } from "react";
import {
  Search,
  Ban,
  AlertTriangle,
  MessageSquare,
  Star,
  User,
  History,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input, Textarea } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { mockCustomers } from "../../../lib/mockData";
import { Customer, Violation } from "../../../types";
import { toast } from "sonner";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import {
  customerApi,
  violationApi,
  ratingApi,
  staffApi,
} from "../../../lib/api";

export function CustomersPage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmCancelText, setConfirmCancelText] = useState("Hủy");
  const [confirmVariant, setConfirmVariant] = useState<
    "info" | "warning" | "danger"
  >("info");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showViolationsHistoryModal, setShowViolationsHistoryModal] =
    useState(false);
  const [violationsList, setViolationsList] = useState<any[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [violationForm, setViolationForm] = useState({
    type: "no_show" as Violation["type"],
    description: "",
  });
  const [feedbackResponse, setFeedbackResponse] = useState("");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [selectedRating, setSelectedRating] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();
    fetchFeedbacks();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAll();
      const transformedData = data.map((customer: any) => ({
        id: customer.id,
        name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        membershipTier: customer.membership_level || "bronze",
        points: customer.points || 0,
        totalSpent: customer.total_spent || 0,
        isBlacklisted: customer.isBanned || customer.is_banned || false,
        violations: customer.violations || [],
      }));
      setCustomers(transformedData);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const data = await ratingApi.getAll();
      const transformedData = await Promise.all(
        data.map(async (rating: any) => {
          const ratingId = rating._id || rating.id;
          const replies = await ratingApi.getReplies(ratingId).catch(() => []);
          const customer = customers.find((c) => c.id === rating.customer_id);
          return {
            id: ratingId,
            customerId: rating.customer_id,
            customerName: customer?.name || "Khách hàng",
            comment: rating.description || "",
            rating: rating.score,
            date: rating.rating_date || rating.created_at || rating.date,
            response: replies.length > 0 ? replies[0].reply_text : "",
            replyId: replies.length > 0 ? replies[0].id : null,
          };
        })
      );
      setFeedbacks(transformedData);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách phản hồi");
    }
  };

  // Mock feedback data
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier =
      tierFilter === "all" || customer.membershipTier === tierFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "blocked" && customer.isBlacklisted) ||
      (statusFilter === "normal" && !customer.isBlacklisted);
    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleViewDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleAddViolation = async () => {
    if (!selectedCustomer || !violationForm.description) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await violationApi.create({
        customer_id: selectedCustomer.id,
        violation_type: violationForm.type,
        description: violationForm.description,
        violation_date: new Date().toISOString().split("T")[0],
      });

      await fetchCustomers();
      toast.success("Đã ghi nhận vi phạm");
      setShowViolationModal(false);
      setViolationForm({ type: "no_show", description: "" });
    } catch (error: any) {
      toast.error(error.message || "Không thể ghi nhận vi phạm");
    }
  };

  const handleBlacklist = async (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const action = customer.isBlacklisted ? "bỏ chặn" : "chặn";
    const actionCapitalized = customer.isBlacklisted ? "Bỏ chặn" : "Chặn";

    setConfirmTitle(`${actionCapitalized} khách hàng`);
    setConfirmMessage(
      `Bạn có chắc muốn ${action} khách hàng ${customer.name}?`
    );
    setConfirmText(actionCapitalized);
    setConfirmCancelText("Hủy");
    setConfirmVariant(`${customer.isBlacklisted ? "info" : "warning"}`);
    setPendingAction(() => async () => {
      try {
        if (customer.isBlacklisted) {
          await customerApi.unban(customerId);
        } else {
          await customerApi.ban(customerId);
        }
        await fetchCustomers();
        toast.success(`Đã ${action} khách hàng`);
      } catch (error: any) {
        toast.error(error.message || `Không thể ${action} khách hàng`);
      }
    });
    setShowConfirmModal(true);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "diamond":
        return "bg-cyan-100 text-cyan-700";
      case "platinum":
        return "bg-slate-100 text-slate-700";
      case "gold":
        return "bg-yellow-100 text-yellow-700";
      case "silver":
        return "bg-gray-300 text-gray-700";
      case "bronze":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTierText = (tier: string) => {
    switch (tier) {
      case "diamond":
        return "Kim cương";
      case "platinum":
        return "Bạch kim";
      case "gold":
        return "Vàng";
      case "silver":
        return "Bạc";
      case "bronze":
        return "Đồng";
      default:
        return tier;
    }
  };

  const getViolationTypeText = (type: string) => {
    const t = String(type || "").toLowerCase();
    switch (t) {
      case "no-show":
      case "no_show":
      case "noshow":
      case "no show":
        return "Không đến";
      case "late-cancel":
      case "late_cancel":
      case "latecancel":
      case "late cancel":
        return "Hủy muộn";
      case "property_damage":
      case "property-damage":
      case "propertydamage":
      case "damage":
        return "Làm hỏng tài sản";
      case "other":
      case "khac":
        return "Khác";
      default:
        // Fallback: capitalize words
        return t.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2>Quản lý khách hàng</h2>
        <p className="text-gray-600 mt-1">
          Theo dõi thông tin và lịch sử giao dịch của khách hàng
        </p>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          <TabsTrigger value="feedback">Phản hồi</TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          {/* Stats */}
          <div className="flex grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <p className="text-gray-600 mb-2">Tổng khách hàng</p>
              <p className="text-3xl">{customers.length}</p>
            </Card>
            {/* <Card className="p-6">
              <p className="text-gray-600 mb-2">Thành viên Vàng</p>
              <p className="text-3xl text-yellow-600">
                {customers.filter((c) => c.membershipTier === "gold").length}
              </p>
            </Card> */}
            <Card className="p-6">
              <p className="text-gray-600 mb-2">Blacklist</p>
              <p className="text-3xl text-red-600">
                {customers.filter((c) => c.isBlacklisted).length}
              </p>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm khách hàng..."
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="w-48">
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Hạng thành viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hạng</SelectItem>
                  <SelectItem value="diamond">Kim cương</SelectItem>
                  <SelectItem value="platinum">Bạch kim</SelectItem>
                  <SelectItem value="gold">Vàng</SelectItem>
                  <SelectItem value="silver">Bạc</SelectItem>
                  <SelectItem value="bronze">Đồng</SelectItem>
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
                  <SelectItem value="normal">Bình thường</SelectItem>
                  <SelectItem value="blocked">Bị chặn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer Table */}
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
                      <th className="text-left p-4">Khách hàng</th>
                      <th className="text-left p-4">Liên hệ</th>
                      <th className="text-left p-4">Hạng</th>
                      <th className="text-left p-4">Điểm</th>
                      <th className="text-left p-4">Trạng thái</th>
                      <th className="text-left p-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <button
                            onClick={() => handleViewDetail(customer)}
                            className="text-[#625EE8] hover:underline"
                          >
                            {customer.name}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p>{customer.phone}</p>
                            <p className="text-gray-600">{customer.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={getTierColor(customer.membershipTier)}
                          >
                            {getTierText(customer.membershipTier)}
                          </Badge>
                        </td>
                        <td className="p-4">{customer.points}</td>
                        <td className="p-4">
                          {customer.isBlacklisted ? (
                            <Badge className="bg-red-100 text-red-700">
                              Bị chặn
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700">
                              Bình thường
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowViolationModal(true);
                              }}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                            <button
                              type="button"
                              onClick={async () => {
                                setSelectedCustomer(customer);
                                try {
                                  const v = await violationApi.getByCustomerId(
                                    customer.id
                                  );
                                  setViolationsList(v || []);
                                } catch (err) {
                                  console.warn(
                                    "Failed to fetch violations for customer",
                                    err
                                  );
                                  setViolationsList([]);
                                }
                                setShowViolationsHistoryModal(true);
                              }}
                              className="ml-1 rounded-full p-2 bg-gray-100 text-gray-700 hover:bg-[#625EE8] hover:text-white transition-colors focus:outline-none"
                              title="Lịch sử vi phạm"
                              aria-label="Lịch sử vi phạm"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleBlacklist(customer.id)}
                              className={
                                customer.isBlacklisted
                                  ? "bg-green-100"
                                  : "bg-red-100"
                              }
                            >
                              <Ban className="w-4 h-4" />
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
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="mb-1">{feedback.customerName}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        {/* <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= feedback.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div> */}
                        <span className="text-sm text-gray-600">
                          {new Date(feedback.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  </div>
                </div>

                {feedback.response ? (
                  <div className="ml-16 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm mb-1">Phản hồi:</p>
                    <p className="text-gray-700">{feedback.response}</p>
                  </div>
                ) : (
                  <div className="ml-16">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedRating(feedback);
                        setShowFeedbackModal(true);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Hồi đáp
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Hồ sơ khách hàng"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Họ tên</p>
                <p>{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Hạng thành viên</p>
                <Badge
                  className={getTierColor(selectedCustomer.membershipTier)}
                >
                  {getTierText(selectedCustomer.membershipTier)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                <p>{selectedCustomer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Điểm tích lũy</p>
                <p>{selectedCustomer.points}</p>
              </div>
            </div>

            {/* Violations */}
            <div>
              <h4 className="mb-3">Lịch sử vi phạm</h4>
              {selectedCustomer.violations.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.violations.map((violation) => (
                    <div
                      key={violation.id}
                      className="p-3 border rounded-lg flex items-start justify-between"
                    >
                      <div>
                        <p className="mb-1">
                          {getViolationTypeText(violation.type)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {violation.description}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(violation.date).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa có vi phạm</p>
              )}
            </div>

            {/* Transaction History */}
            <div>
              <h4 className="mb-3">Lịch sử giao dịch</h4>
              <div className="text-gray-500 text-sm">Chưa có giao dịch</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Violation Modal */}
      <Modal
        isOpen={showViolationModal}
        onClose={() => setShowViolationModal(false)}
        title="Ghi nhận vi phạm"
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2">
              Khách hàng: <span>{selectedCustomer?.name}</span>
            </p>
          </div>

          <div>
            <label className="block mb-2">Loại vi phạm</label>
            <select
              value={violationForm.type}
              onChange={(e) =>
                setViolationForm({
                  ...violationForm,
                  type: e.target.value as Violation["type"],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="no_show">Không đến (No-show)</option>
              <option value="late_cancel">Hủy muộn</option>
              <option value="property_damage">Làm hỏng tài sản</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <Textarea
            label="Mô tả chi tiết"
            value={violationForm.description}
            onChange={(e) =>
              setViolationForm({
                ...violationForm,
                description: e.target.value,
              })
            }
            placeholder="Nhập mô tả chi tiết về vi phạm..."
            rows={4}
          />

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowViolationModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleAddViolation}>
              Lưu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Violations History Modal */}
      <Modal
        isOpen={showViolationsHistoryModal}
        onClose={() => setShowViolationsHistoryModal(false)}
        title="Lịch sử vi phạm"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Khách hàng: <strong>{selectedCustomer?.name}</strong>
          </p>

          {violationsList && violationsList.length > 0 ? (
            <div className="space-y-3">
              {violationsList.map((v: any) => {
                const typeField =
                  v.violation_type ?? v.type ?? v.violationType ?? "other";
                const descField =
                  v.description ?? v.desc ?? v.detail ?? "(Không có mô tả)";
                const dateField =
                  v.violation_date ?? v.date ?? v.violationDate ?? null;
                const key =
                  v.id || v._id || `${typeField}-${dateField || Math.random()}`;

                return (
                  <div
                    key={key}
                    className="p-3 border rounded-lg flex items-start justify-between"
                  >
                    <div>
                      <p className="font-medium mb-1">
                        {getViolationTypeText(typeField)}
                      </p>
                      <p className="text-sm text-gray-600">{descField}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {dateField
                        ? new Date(dateField).toLocaleDateString("vi-VN")
                        : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có vi phạm</p>
          )}
        </div>
      </Modal>

      {/* Feedback Response Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Hồi đáp phản hồi"
      >
        <div className="space-y-4">
          <Textarea
            label="Nội dung phản hồi"
            value={feedbackResponse}
            onChange={(e) => setFeedbackResponse(e.target.value)}
            placeholder="Nhập nội dung phản hồi cho khách hàng..."
            rows={4}
          />

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowFeedbackModal(false)}
            >
              Hủy
            </Button>
            <Button
              fullWidth
              onClick={async () => {
                if (!selectedRating || !feedbackResponse) {
                  toast.error("Vui lòng nhập nội dung phản hồi");
                  return;
                }

                try {
                  // Lấy staff manager đầu tiên để gửi reply
                  const staffList = await staffApi.getAll({ role: "manager" });
                  if (!staffList || staffList.length === 0) {
                    toast.error("Không tìm thấy manager để gửi phản hồi");
                    return;
                  }
                  const staffId = staffList[0].id;

                  // Gọi API với object RatingReplyData đúng signature
                  await ratingApi.createReply(selectedRating.id, {
                    staff_id: staffId,
                    reply_text: feedbackResponse,
                  });

                  await fetchFeedbacks();
                  toast.success("Đã gửi phản hồi");
                  setShowFeedbackModal(false);
                  setFeedbackResponse("");
                  setSelectedRating(null);
                } catch (error: any) {
                  toast.error(error.message || "Không thể gửi phản hồi");
                }
              }}
            >
              Gửi phản hồi
            </Button>
          </div>
        </div>
      </Modal>

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
    </div>
  );
}
