import {
  Table,
  MenuItem,
  Booking,
  Invoice,
  InventoryItem,
  Supplier,
  Promotion,
  Customer,
  Reward,
  PointHistory,
  VoucherHistory,
} from "../types";

// Mock Tables
export const mockTables: Table[] = [
  {
    id: "1",
    number: "T01",
    area: "Main Hall",
    seats: 4,
    status: "free",
    floor: "Floor 1",
  },
  {
    id: "2",
    number: "T02",
    area: "Main Hall",
    seats: 4,
    status: "occupied",
    floor: "Floor 1",
  },
  {
    id: "3",
    number: "T03",
    area: "Main Hall",
    seats: 2,
    status: "free",
    floor: "Floor 1",
  },
  {
    id: "4",
    number: "T04",
    area: "VIP",
    seats: 6,
    status: "reserved",
    floor: "Floor 2",
  },
  {
    id: "5",
    number: "T05",
    area: "VIP",
    seats: 8,
    status: "free",
    floor: "Floor 2",
  },
  {
    id: "6",
    number: "T06",
    area: "Main Hall",
    seats: 4,
    status: "dirty",
    floor: "Floor 1",
  },
  {
    id: "7",
    number: "T07",
    area: "Outdoor",
    seats: 4,
    status: "free",
    floor: "Floor 1",
  },
  {
    id: "8",
    number: "T08",
    area: "Outdoor",
    seats: 2,
    status: "broken",
    floor: "Floor 1",
    brokenReason: "Ghế bị gãy chân, cần thay thế",
  },
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Phở Bò Đặc Biệt",
    category: "Món chính",
    price: 85000,
    description: "Phở bò truyền thống với thịt bò tươi ngon",
    image: "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400",
    available: true,
    ingredients: ["Bánh phở", "Thịt bò", "Hành", "Ngò"],
  },
  {
    id: "2",
    name: "Bún Ch Hà Nội",
    category: "Món chính",
    price: 75000,
    description: "Bún chả nướng than hoa thơm ngon",
    image: "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400",
    available: true,
  },
  {
    id: "3",
    name: "Gỏi Cuốn Tôm Thịt",
    category: "Khai vị",
    price: 45000,
    description: "Gỏi cuốn tươi mát với tôm và thịt",
    image: "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400",
    available: true,
    ingredients: ["Bánh tráng", "Tôm", "Thịt", "Rau sống", "Bún"],
  },
  {
    id: "4",
    name: "Cơm Gà Xối Mỡ",
    category: "Món chính",
    price: 65000,
    description: "Cơm gà Hải Nam thơm ngon",
    available: false,
    ingredients: ["Cơm", "Gà", "Mỡ gà", "Nước sốt đặc biệt"],
  },
  {
    id: "5",
    name: "Trà Đá Chanh",
    category: "Đồ uống",
    price: 20000,
    description: "Trà chanh mát lạnh",
    available: true,
    ingredients: ["Trà", "Chanh tươi", "Đường", "Đá"],
  },
  {
    id: "6",
    name: "Sinh Tố Bơ",
    category: "Đồ uống",
    price: 35000,
    description: "Sinh tố bơ béo ngậy",
    available: true,
    ingredients: ["Bơ", "Sữa tươi", "Đường", "Đá"],
  },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: "B001",
    customerId: "C001",
    customerName: "Nguyễn Văn An",
    customerPhone: "0912345678",
    tableId: "4",
    date: "2025-12-11",
    time: "19:00",
    guests: 4,
    specialRequests: "Muốn bàn gần cửa sổ",
    depositAmount: 200000,
    depositPaid: true,
    status: "confirmed",
  },
  {
    id: "B002",
    customerId: "C002",
    customerName: "Trần Thị Bình",
    customerPhone: "0987654321",
    tableId: "5",
    date: "2025-12-10",
    time: "18:30",
    guests: 6,
    depositAmount: 300000,
    depositPaid: false,
    status: "pending",
  },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: "INV001",
    tableId: "2",
    customerId: "C003",
    items: [
      {
        id: "1",
        menuItem: mockMenuItems[0],
        quantity: 2,
        status: "served",
      },
      {
        id: "2",
        menuItem: mockMenuItems[2],
        quantity: 1,
        status: "served",
      },
    ],
    subtotal: 215000,
    tax: 21500,
    discount: 0,
    total: 236500,
    status: "pending",
    createdAt: "2025-12-10T18:30:00",
  },
  {
    id: "INV002",
    tableId: "4",
    customerId: "C001",
    items: [
      {
        id: "3",
        menuItem: mockMenuItems[1],
        quantity: 2,
        status: "served",
      },
      {
        id: "4",
        menuItem: mockMenuItems[4],
        quantity: 2,
        status: "served",
      },
    ],
    subtotal: 190000,
    tax: 19000,
    discount: 0,
    total: 209000,
    status: "paid",
    paymentMethod: "online",
    paidAt: "2025-12-10T12:45:00",
    createdAt: "2025-12-10T11:30:00",
  },
  {
    id: "INV003",
    tableId: "5",
    customerId: "C002",
    items: [
      {
        id: "5",
        menuItem: mockMenuItems[0],
        quantity: 3,
        status: "served",
      },
      {
        id: "6",
        menuItem: mockMenuItems[2],
        quantity: 2,
        status: "served",
      },
      {
        id: "7",
        menuItem: mockMenuItems[5],
        quantity: 3,
        status: "served",
      },
    ],
    subtotal: 450000,
    tax: 45000,
    discount: 45000,
    total: 450000,
    status: "paid",
    paymentMethod: "online",
    paidAt: "2025-12-09T19:20:00",
    createdAt: "2025-12-09T18:00:00",
  },
  {
    id: "INV004",
    tableId: "7",
    customerId: "C004",
    items: [
      {
        id: "8",
        menuItem: mockMenuItems[1],
        quantity: 1,
        status: "served",
      },
      {
        id: "9",
        menuItem: mockMenuItems[4],
        quantity: 1,
        status: "served",
      },
    ],
    subtotal: 95000,
    tax: 9500,
    discount: 0,
    total: 104500,
    status: "paid",
    paymentMethod: "online",
    paidAt: "2025-12-08T14:30:00",
    createdAt: "2025-12-08T13:15:00",
  },
];

// Mock Inventory
export const mockInventory: InventoryItem[] = [
  {
    id: "INV001",
    name: "Thịt bò tươi",
    quantity: 25,
    unit: "kg",
    expiryDate: "2025-12-15",
    supplierId: "SUP001",
    lastUpdated: "2025-12-10",
  },
  {
    id: "INV002",
    name: "Bánh phở",
    quantity: 50,
    unit: "kg",
    expiryDate: "2025-12-20",
    supplierId: "SUP002",
    lastUpdated: "2025-12-10",
  },
  {
    id: "INV003",
    name: "Rau sống",
    quantity: 5,
    unit: "kg",
    expiryDate: "2025-12-12",
    supplierId: "SUP001",
    lastUpdated: "2025-12-10",
  },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: "SUP001",
    name: "Công ty Thực phẩm An Phát",
    phone: "0243123456",
    address: "Số 123, Đường ABC, Hà Nội",
  },
  {
    id: "SUP002",
    name: "Nhà cung cấp Bánh Phở Hà Thành",
    phone: "0249876543",
    address: "Số 456, Đường XYZ, Hà Nội",
  },
];

// Mock Promotions
export const mockPromotions: Promotion[] = [
  {
    id: "PROMO001",
    name: "Giảm 15% cho hóa đơn đầu tiên",
    code: "FIRST15",
    discountType: "percentage",
    discountValue: 15,
    description: "Dành cho khách hàng mới đăng ký thành viên",
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    active: true,
  },
  {
    id: "PROMO002",
    name: "Tặng món khai vị",
    code: "WEEKEND500",
    discountType: "fixed",
    discountValue: 50000,
    description: "Cho đơn hàng từ 500.000đ vào cuối tuần",
    minOrderAmount: 500000,
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    active: true,
  },
  {
    id: "PROMO003",
    name: "Giảm giá mùa đông",
    code: "WINTER2025",
    discountType: "percentage",
    discountValue: 20,
    description: "Áp dụng cho tất cả món ăn",
    maxDiscountAmount: 100000,
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    active: true,
  },
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: "C001",
    name: "Nguyễn Văn An",
    email: "an.nguyen@email.com",
    phone: "0912345678",
    role: "customer",
    membershipTier: "gold",
    points: 1500,
    violations: [],
    isBlacklisted: false,
  },
  {
    id: "C002",
    name: "Trần Thị Bình",
    phone: "0987654321",
    role: "customer",
    membershipTier: "silver",
    points: 800,
    violations: [
      {
        id: "V001",
        customerId: "C002",
        type: "late-cancel",
        description: "Hủy đặt bàn muộn 1 giờ",
        date: "2025-11-20",
      },
    ],
    isBlacklisted: false,
  },
];

// Mock Rewards
export const mockRewards: Reward[] = [
  {
    id: "R001",
    name: "Voucher giảm 100.000đ",
    pointsCost: 500,
    description: "Giảm 100.000đ cho hóa đơn từ 500.000đ",
    image: "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400",
  },
  {
    id: "R002",
    name: "Món khai vị miễn phí",
    pointsCost: 300,
    description: "Tặng 1 món khai vị bất kỳ",
  },
  {
    id: "R003",
    name: "Nước uống miễn phí",
    pointsCost: 200,
    description: "Tặng 2 ly nước uống",
  },
];

// Mock Point History
export const mockPointHistory: PointHistory[] = [
  {
    id: "PH001",
    type: "earned",
    amount: 50,
    description: "Tích điểm từ hóa đơn INV002",
    date: "2025-12-10T12:45:00",
    invoiceId: "INV002",
  },
  {
    id: "PH002",
    type: "redeemed",
    amount: -1000,
    description: "Quy đổi 1000 điểm = 1.000đ giảm giá",
    date: "2025-12-09T19:20:00",
    invoiceId: "INV003",
  },
  {
    id: "PH003",
    type: "earned",
    amount: 100,
    description: "Tích điểm từ hóa đơn INV003",
    date: "2025-12-09T19:20:00",
    invoiceId: "INV003",
  },
];

// Mock Voucher History
export const mockVoucherHistory: VoucherHistory[] = [
  {
    id: "VH001",
    voucherCode: "WINTER2025",
    voucherName: "Giảm giá mùa đông",
    discountAmount: 67500,
    usedAt: "2025-12-09T19:20:00",
    invoiceId: "INV003",
  },
];
