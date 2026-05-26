// Dữ liệu mẫu đơn bán lẻ tại quầy (POS)
import { products } from './mockData';

// Trạng thái đơn
export const ORDER_STATUS = {
  PENDING: 'pending',     // Chưa xuất hóa đơn
  INVOICED: 'invoiced',   // Đã xuất hóa đơn
  CANCELLED: 'cancelled', // Đã hủy
};

// Quy tắc phân quyền sửa đơn:
//   admin  → sửa tất cả đơn chưa xuất hóa đơn
//   staff  → chỉ sửa đơn của chính mình, chưa xuất hóa đơn
export function canEditOrder(order, user) {
  if (!user) return false;
  if (order.status === ORDER_STATUS.INVOICED) return false;
  if (order.status === ORDER_STATUS.CANCELLED) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'staff') return order.staffUsername === user.username;
  return false;
}

// Tạo ngày giả lập trong vài ngày gần đây
function daysAgo(days, h = 9, m = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const posOrders = [
  {
    id: 'POS-20240001',
    status: ORDER_STATUS.INVOICED,
    createdAt: daysAgo(0, 8, 15),
    customer: {
      name: 'Nguyễn Văn An',
      dob: '1985-03-12',
      gender: 'Nam',
      phone: '0912345678',
      address: '123 Lê Lợi, Q.1, TP.HCM',
    },
    doctor: '',
    diagnosis: '',
    staffUsername: 'nhanvien',
    staffName: 'Nguyễn Thị Lan',
    items: [
      { ...products[3], qty: 2 },
      { ...products[4], qty: 1 },
    ],
    total: products[3].price * 2 + products[4].price,
    note: '',
  },
  {
    id: 'POS-20240002',
    status: ORDER_STATUS.PENDING,
    createdAt: daysAgo(0, 10, 30),
    customer: {
      name: 'Trần Thị Bích',
      dob: '1990-07-25',
      gender: 'Nữ',
      phone: '0923456789',
      address: '45 Nguyễn Huệ, Q.1, TP.HCM',
    },
    doctor: 'BS. Trần Văn Minh',
    diagnosis: 'Viêm phổi nhẹ',
    staffUsername: 'nhanvien',
    staffName: 'Nguyễn Thị Lan',
    items: [
      { ...products[1], qty: 1 },
      { ...products[2], qty: 3 },
    ],
    total: products[1].price + products[2].price * 3,
    note: 'Khách yêu cầu giao hàng',
  },
  {
    id: 'POS-20240003',
    status: ORDER_STATUS.INVOICED,
    createdAt: daysAgo(0, 14, 0),
    customer: {
      name: 'Lê Minh Tuấn',
      dob: '1978-11-03',
      gender: 'Nam',
      phone: '0934567890',
      address: '78 Điện Biên Phủ, Q.Bình Thạnh',
    },
    doctor: '',
    diagnosis: '',
    staffUsername: 'nhanvien2',
    staffName: 'Trần Văn Hùng',
    items: [
      { ...products[0], qty: 1 },
      { ...products[8], qty: 1 },
    ],
    total: products[0].price + products[8].price,
    note: '',
  },
  {
    id: 'POS-20240004',
    status: ORDER_STATUS.PENDING,
    createdAt: daysAgo(1, 9, 45),
    customer: {
      name: 'Phạm Thị Hoa',
      dob: '1995-02-14',
      gender: 'Nữ',
      phone: '0945678901',
      address: '12 Cách Mạng Tháng 8, Q.3',
    },
    doctor: 'BS. Lê Thị Ngọc',
    diagnosis: 'Tăng huyết áp',
    staffUsername: 'nhanvien2',
    staffName: 'Trần Văn Hùng',
    items: [
      { ...products[10], qty: 2 },
      { ...products[11], qty: 1 },
    ],
    total: products[10].price * 2 + products[11].price,
    note: '',
  },
  {
    id: 'POS-20240005',
    status: ORDER_STATUS.PENDING,
    createdAt: daysAgo(1, 15, 20),
    customer: {
      name: 'Hoàng Văn Đức',
      dob: '1988-06-30',
      gender: 'Nam',
      phone: '0956789012',
      address: '99 Pasteur, Q.3, TP.HCM',
    },
    doctor: '',
    diagnosis: '',
    staffUsername: 'nhanvien',
    staffName: 'Nguyễn Thị Lan',
    items: [
      { ...products[6], qty: 1 },
      { ...products[2], qty: 2 },
    ],
    total: products[6].price + products[2].price * 2,
    note: 'Khách quen',
  },
  {
    id: 'POS-20240006',
    status: ORDER_STATUS.CANCELLED,
    createdAt: daysAgo(2, 11, 10),
    customer: {
      name: 'Vũ Thị Mai',
      dob: '2001-09-18',
      gender: 'Nữ',
      phone: '0967890123',
      address: '55 Lý Tự Trọng, Q.1',
    },
    doctor: '',
    diagnosis: '',
    staffUsername: 'nhanvien2',
    staffName: 'Trần Văn Hùng',
    items: [
      { ...products[7], qty: 1 },
    ],
    total: products[7].price,
    note: 'Khách đổi ý',
  },
  {
    id: 'POS-20240007',
    status: ORDER_STATUS.INVOICED,
    createdAt: daysAgo(2, 16, 40),
    customer: {
      name: 'Đặng Văn Phúc',
      dob: '1972-12-05',
      gender: 'Nam',
      phone: '0978901234',
      address: '200 Nguyễn Trãi, Q.5',
    },
    doctor: 'BS. Nguyễn Hoàng',
    diagnosis: 'Tiểu đường type 2',
    staffUsername: 'nhanvien',
    staffName: 'Nguyễn Thị Lan',
    items: [
      { ...products[8], qty: 1 },
      { ...products[3], qty: 4 },
    ],
    total: products[8].price + products[3].price * 4,
    note: '',
  },
  {
    id: 'POS-20240008',
    status: ORDER_STATUS.PENDING,
    createdAt: daysAgo(3, 9, 0),
    customer: {
      name: 'Bùi Thị Thanh',
      dob: '1983-04-22',
      gender: 'Nữ',
      phone: '0989012345',
      address: '34 Trần Hưng Đạo, Q.1',
    },
    doctor: '',
    diagnosis: '',
    staffUsername: 'nhanvien2',
    staffName: 'Trần Văn Hùng',
    items: [
      { ...products[9], qty: 1 },
      { ...products[4], qty: 2 },
    ],
    total: products[9].price + products[4].price * 2,
    note: '',
  },
];
