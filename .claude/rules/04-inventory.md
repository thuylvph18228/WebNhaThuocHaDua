# Tính năng Quản lý kho

Route `/quan-ly-kho` — dành cho **admin** và **staff**. Tất cả nghiệp vụ kho theo dõi đến **cấp độ lô hàng (batch)**.

## Cấu trúc dữ liệu lô hàng

```
Lo (Lô hàng):
  ma_lo          -- mã lô (do nhà cung cấp hoặc tự tạo)
  thuoc_id       -- liên kết đến sản phẩm thuốc
  kho_id         -- thuộc kho nào
  so_luong_nhap  -- số lượng ban đầu khi nhập
  ton_hien_tai   -- tồn thực tế (giảm dần khi xuất/bán)
  han_su_dung    -- ngày hết hạn
  ngay_san_xuat
  gia_nhap       -- giá nhập lô này
  nha_cung_cap
```

**Quy tắc tồn kho:**
- Lô `ton_hien_tai = 0` **không hiển thị** ở bất kỳ đâu (POS, trang sản phẩm, tìm kiếm)
- Khi bán (POS) hoặc xuất kho: trừ `ton_hien_tai` của lô được chọn
- Ưu tiên xuất lô **gần hết hạn trước** (FEFO — First Expired First Out)
- Tổng tồn = tổng `ton_hien_tai` của tất cả lô còn hạn và còn tồn

## Tabs trong Inventory.jsx

| Tab | Màu | Chức năng |
|---|---|---|
| 📦 Tồn kho | Xanh | Tổng hợp tồn theo sản phẩm, cảnh báo sắp hết/sắp HH |
| 🗂️ Lô hàng | Xám | Tra cứu chi tiết từng lô |
| 📋 Phiếu nhập | Xanh | Tạo + duyệt phiếu nhập — số phiếu `NK26XXXXXX` |
| 📤 Xuất kho | Đỏ | Tạo + duyệt phiếu xuất — số phiếu `XK26XXXXXX` |
| 🔄 Luân chuyển | Xanh dương | Tạo + duyệt phiếu luân chuyển — số phiếu `LC26XXXXXX` |
| ⚙️ Danh mục | Cam | Admin only — CRUD lý do nhập/xuất, NCC, kho |

## Workflow phiếu (chung)

`Chưa duyệt (draft)` → **Duyệt** → `Đã duyệt (approved)`
- Duyệt phiếu nhập: cộng `ton_hien_tai` (TODO: chưa implement trong mock)
- Duyệt phiếu xuất: **giảm** `batch.remaining` theo từng dòng
- Duyệt phiếu luân chuyển: giảm tồn kho nguồn
- **Hủy duyệt**: hoàn trả tồn kho (có điều kiện với phiếu nhập: kiểm tra `remaining < quantity`)

## Phiếu nhập — header fields

Lý do nhập · Ngày nhập · Nhà cung cấp · Kho nhập · Người giao · Người nhận · Mã/Số/Ngày hóa đơn (bắt buộc nếu lý do = "Nhập hóa đơn") · Ghi chú

## Phiếu xuất — header fields

Lý do xuất (Hư hỏng / Hết hạn / Trả NCC / Nội bộ / Khác) · Kho xuất · Ngày xuất · Ghi chú

**Lines**: chọn thuốc → chọn lô (dropdown hiện mã lô, HH, tồn) → nhập SL (max = tồn lô)

## Phiếu luân chuyển — header fields

Kho xuất (nguồn) · Kho nhập (đích, phải khác nguồn) · Ngày chuyển · Ghi chú

**Lines**: giống phiếu xuất

## Danh mục master data (code = số tự nhiên tăng dần, không sửa)

- Lý do nhập: code 1–5 (`initialReasons`)
- Lý do xuất: code 1–5 (`initialExportReasons`)
- Nhà cung cấp: code 1–9 (`initialSuppliers`)
- Kho hàng: code 1–4 (`initialWarehouses`)

## Số phiếu tự sinh (pattern)

```
NK26XXXXXX  -- phiếu nhập
XK26XXXXXX  -- phiếu xuất
LC26XXXXXX  -- luân chuyển
```
`peekNextXxxNo()` — xem số tiếp theo KHÔNG tăng counter
`consumeXxxNo()` — lấy số VÀ tăng counter (chỉ gọi khi thực sự lưu)

## API kho cần xây dựng (BE)

```
POST   /api/kho/nhap                   -- tạo phiếu nhập
PUT    /api/kho/nhap/{id}/duyet        -- duyệt (cộng tồn)
POST   /api/kho/xuat                   -- tạo phiếu xuất
PUT    /api/kho/xuat/{id}/duyet        -- duyệt (trừ tồn)
POST   /api/kho/luan-chuyen            -- tạo phiếu luân chuyển
PUT    /api/kho/luan-chuyen/{id}/duyet -- duyệt (trừ nguồn, cộng đích)
GET    /api/kho/ton-kho                -- tra cứu tồn theo lô (?thuoc=&kho=&conTon=true)
GET    /api/kho/canh-bao               -- lô sắp hết hạn + sắp hết tồn
```
