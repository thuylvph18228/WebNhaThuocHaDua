// Dữ liệu mẫu quản lý kho — lô hàng và tồn kho
// products không import ở đây nữa — được truyền vào getStockSummary(products) từ context

// Trạng thái lô hàng
export const BATCH_STATUS = {
  ACTIVE: 'active',       // Đang bán
  LOW: 'low',             // Sắp hết hàng (< ngưỡng cảnh báo)
  EXPIRING: 'expiring',   // Sắp hết hạn (< 30 ngày)
  EXPIRED: 'expired',     // Đã hết hạn
};

// Tính trạng thái lô dựa theo tồn kho và ngày hết hạn
export function getBatchStatus(batch) {
  const today = new Date();
  const expiry = new Date(batch.expiryDate);
  const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return BATCH_STATUS.EXPIRED;
  if (daysLeft <= 30) return BATCH_STATUS.EXPIRING;
  if (batch.remaining <= batch.lowStockThreshold) return BATCH_STATUS.LOW;
  return BATCH_STATUS.ACTIVE;
}

// Tạo ngày trong tương lai / quá khứ
function addDays(d, days) {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

const today = new Date();

export const batches = [
  {
    id: 'LO-001',
    productId: 1,
    batchNo: 'HEM7121-2024-01',
    importDate: addDays(today, -60),
    expiryDate: addDays(today, 700),
    quantity: 30,
    remaining: 18,
    lowStockThreshold: 10,
    supplier: 'Công ty TNHH Thiết bị Y tế Miền Nam',
    importPrice: 750000,
    note: '',
  },
  {
    id: 'LO-002',
    productId: 2,
    batchNo: 'MC246-2024-03',
    importDate: addDays(today, -30),
    expiryDate: addDays(today, 900),
    quantity: 80,
    remaining: 62,
    lowStockThreshold: 15,
    supplier: 'Công ty TNHH Thiết bị Y tế Miền Nam',
    importPrice: 200000,
    note: '',
  },
  {
    id: 'LO-003',
    productId: 3,
    batchNo: 'VITC-2024-02',
    importDate: addDays(today, -45),
    expiryDate: addDays(today, 20),  // Sắp hết hạn!
    quantity: 100,
    remaining: 45,
    lowStockThreshold: 20,
    supplier: 'Dược phẩm Sài Gòn',
    importPrice: 310000,
    note: 'Lô cũ — ưu tiên bán trước',
  },
  {
    id: 'LO-004',
    productId: 3,
    batchNo: 'VITC-2024-05',
    importDate: addDays(today, -10),
    expiryDate: addDays(today, 540),
    quantity: 150,
    remaining: 150,
    lowStockThreshold: 20,
    supplier: 'Dược phẩm Sài Gòn',
    importPrice: 310000,
    note: '',
  },
  {
    id: 'LO-005',
    productId: 4,
    batchNo: 'PANA-2024-04',
    importDate: addDays(today, -20),
    expiryDate: addDays(today, 400),
    quantity: 500,
    remaining: 8,   // Sắp hết!
    lowStockThreshold: 50,
    supplier: 'Haleon Vietnam',
    importPrice: 28000,
    note: '',
  },
  {
    id: 'LO-006',
    productId: 5,
    batchNo: 'EUGI-2024-02',
    importDate: addDays(today, -90),
    expiryDate: addDays(today, -5), // Đã hết hạn!
    quantity: 50,
    remaining: 12,
    lowStockThreshold: 10,
    supplier: 'Công ty Dược Enlie Pharma',
    importPrice: 68000,
    note: 'NGỪNG BÁN — đã hết hạn',
  },
  {
    id: 'LO-007',
    productId: 6,
    batchNo: 'NEC801-2024-01',
    importDate: addDays(today, -50),
    expiryDate: addDays(today, 1200),
    quantity: 20,
    remaining: 5,   // Sắp hết!
    lowStockThreshold: 5,
    supplier: 'Công ty TNHH Thiết bị Y tế Miền Nam',
    importPrice: 1050000,
    note: '',
  },
  {
    id: 'LO-008',
    productId: 7,
    batchNo: 'OMEG-2024-03',
    importDate: addDays(today, -15),
    expiryDate: addDays(today, 600),
    quantity: 120,
    remaining: 110,
    lowStockThreshold: 20,
    supplier: 'Dược phẩm Sài Gòn',
    importPrice: 245000,
    note: '',
  },
  {
    id: 'LO-009',
    productId: 8,
    batchNo: 'CETA-2024-02',
    importDate: addDays(today, -25),
    expiryDate: addDays(today, 25), // Sắp hết hạn!
    quantity: 60,
    remaining: 28,
    lowStockThreshold: 10,
    supplier: 'Galderma Vietnam',
    importPrice: 150000,
    note: 'Lô cũ — cần giải phóng hàng',
  },
  {
    id: 'LO-010',
    productId: 10,
    batchNo: 'SIMI-2024-01',
    importDate: addDays(today, -40),
    expiryDate: addDays(today, 300),
    quantity: 50,
    remaining: 32,
    lowStockThreshold: 10,
    supplier: 'Abbott Vietnam',
    importPrice: 480000,
    note: '',
  },
  {
    id: 'LO-011',
    productId: 11,
    batchNo: 'AMLO-2024-03',
    importDate: addDays(today, -10),
    expiryDate: addDays(today, 500),
    quantity: 200,
    remaining: 180,
    lowStockThreshold: 30,
    supplier: 'Sanofi Vietnam',
    importPrice: 38000,
    note: 'Thuốc kê đơn — kiểm soát chặt',
  },
  {
    id: 'LO-012',
    productId: 12,
    batchNo: 'CALC-2024-02',
    importDate: addDays(today, -35),
    expiryDate: addDays(today, 450),
    quantity: 100,
    remaining: 75,
    lowStockThreshold: 15,
    supplier: 'Sandoz Vietnam',
    importPrice: 100000,
    note: '',
  },
];

// Tổng hợp tồn kho theo sản phẩm (gộp tất cả lô còn active)
// products được truyền từ ProductContext để phản ánh danh mục động
export function getStockSummary(products) {
  return products.map(product => {
    const productBatches = batches.filter(b => b.productId === product.id);
    const totalRemaining = productBatches.reduce((s, b) => s + b.remaining, 0);
    const activeBatches = productBatches.filter(b => {
      const status = getBatchStatus(b);
      return status !== BATCH_STATUS.EXPIRED;
    });
    const nearestExpiry = activeBatches.length > 0
      ? activeBatches.reduce((min, b) => b.expiryDate < min ? b.expiryDate : min, activeBatches[0].expiryDate)
      : null;
    const minThreshold = productBatches.length > 0
      ? Math.min(...productBatches.map(b => b.lowStockThreshold))
      : 10;

    const hasExpired = productBatches.some(b => getBatchStatus(b) === BATCH_STATUS.EXPIRED);
    const hasExpiring = productBatches.some(b => getBatchStatus(b) === BATCH_STATUS.EXPIRING);
    const isLow = totalRemaining <= minThreshold;

    return {
      product,
      totalRemaining,
      batchCount: productBatches.length,
      nearestExpiry,
      lowStockThreshold: minThreshold,
      isLow,
      hasExpiring,
      hasExpired,
      status: hasExpired ? 'expired' : hasExpiring ? 'expiring' : isLow ? 'low' : 'ok',
    };
  });
}

/**
 * Master data — danh mục lý do nhập, nhà cung cấp, kho.
 * code: số tự nhiên tăng dần (1, 2, 3...), tự động sinh, không cho phép sửa.
 * Chỉ admin được thêm/sửa tên/xóa. Dữ liệu này là initial state cho React.
 */

// Lý do nhập — mã là số tự nhiên
export const initialReasons = [
  { code: 1, name: 'Nhập hóa đơn',        requiresInvoice: true,  active: true },
  { code: 2, name: 'Điều chỉnh tồn kho',  requiresInvoice: false, active: true },
  { code: 3, name: 'Nhập hàng trả về',    requiresInvoice: false, active: true },
  { code: 4, name: 'Nhập chuyển kho',     requiresInvoice: false, active: true },
  { code: 5, name: 'Nhập khác',           requiresInvoice: false, active: true },
];

// Nhà cung cấp — mã là số tự nhiên
export const initialSuppliers = [
  { code: 1, name: 'Công ty TNHH Thiết bị Y tế Miền Nam', active: true },
  { code: 2, name: 'Dược phẩm Sài Gòn',                   active: true },
  { code: 3, name: 'Haleon Vietnam',                       active: true },
  { code: 4, name: 'Công ty Dược Enlie Pharma',            active: true },
  { code: 5, name: 'Galderma Vietnam',                     active: true },
  { code: 6, name: 'Abbott Vietnam',                       active: true },
  { code: 7, name: 'Sanofi Vietnam',                       active: true },
  { code: 8, name: 'Sandoz Vietnam',                       active: true },
  { code: 9, name: 'Boehringer Ingelheim Vietnam',         active: true },
];

// Kho hàng — mã là số tự nhiên
export const initialWarehouses = [
  { code: 1, name: 'Kho chính',             active: true },
  { code: 2, name: 'Kho lạnh (2–8°C)',      active: true },
  { code: 3, name: 'Kho thuốc kê đơn (Rx)', active: true },
  { code: 4, name: 'Kho dược mỹ phẩm',      active: true },
];

// Lý do xuất kho
export const initialExportReasons = [
  { code: 1, name: 'Hư hỏng',           active: true },
  { code: 2, name: 'Hết hạn sử dụng',  active: true },
  { code: 3, name: 'Trả nhà cung cấp', active: true },
  { code: 4, name: 'Dùng nội bộ',      active: true },
  { code: 5, name: 'Xuất khác',         active: true },
];

// Số phiếu xuất kho: XK + 2 số năm + 6 số thứ tự tăng dần
let exportSeq = 1;
function makeExportNo(seq) {
  return `XK${String(new Date().getFullYear()).slice(-2)}${String(seq).padStart(6, '0')}`;
}
export function peekNextExportNo()  { return makeExportNo(exportSeq); }
export function consumeExportNo()   { return makeExportNo(exportSeq++); }

// Số phiếu luân chuyển: LC + 2 số năm + 6 số thứ tự tăng dần
let transferSeq = 1;
function makeTransferNo(seq) {
  return `LC${String(new Date().getFullYear()).slice(-2)}${String(seq).padStart(6, '0')}`;
}
export function peekNextTransferNo()  { return makeTransferNo(transferSeq); }
export function consumeTransferNo()   { return makeTransferNo(transferSeq++); }

// Tương thích ngược cho các chỗ dùng cũ
export const suppliers = initialSuppliers.map(s => s.name);
export const warehouses = initialWarehouses.map(w => ({ id: w.code, name: w.name }));
export const importReasons = initialReasons.map(r => ({
  value: r.code, label: r.name, requiresInvoice: r.requiresInvoice,
}));

// Số phiếu nhập: NK + 2 số năm + 6 số thứ tự tăng dần
// Dùng peekNextReceiptNo() để xem số tiếp theo MÀ KHÔNG tăng counter.
// Dùng consumeReceiptNo() khi thực sự lưu phiếu để lấy số và tăng counter.
let receiptSeq = 1;
function makeReceiptNo(seq) {
  const year = String(new Date().getFullYear()).slice(-2);
  return `NK${year}${String(seq).padStart(6, '0')}`;
}
export function peekNextReceiptNo() {
  return makeReceiptNo(receiptSeq);
}
export function consumeReceiptNo() {
  return makeReceiptNo(receiptSeq++);
}
// Tương thích ngược
export function generateReceiptNo() {
  return consumeReceiptNo();
}
