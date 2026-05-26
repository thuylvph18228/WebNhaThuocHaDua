# Quy ước & Domain đặc thù

## Quy ước chung

- Comment trong code viết bằng **tiếng Việt**
- Sau mỗi thay đổi lớn, chụp screenshot và so sánh với design gốc
- Website phải **mobile-friendly**
- Mọi section public phải có **animation khi scroll** (`useScrollAnimation` hook từ `hooks/useScrollAnimation.js`)
- Ảnh placeholder dùng `placehold.co` hoặc `via.placeholder.com`

## Domain đặc thù — Nhà thuốc

- **Thuốc kê đơn** (`isRx: true`): hiển thị badge "Rx", cảnh báo, yêu cầu upload toa bác sĩ khi mua online
- Mỗi sản phẩm thuốc cần: `registrationNo` (số đăng ký), `activeIngredient` (hoạt chất), `maview` (barcode nội bộ), nhà sản xuất
- Tồn kho tính theo **lô** — lô hết tồn không hiển thị ở bất kỳ đâu
- POS bán hàng: trừ tồn theo FEFO (lô gần hết hạn nhất xuất trước)

## Phân quyền

| Role | Quyền |
|---|---|
| `customer` | Xem sản phẩm, mua hàng online |
| `staff` | + POS, xem/tạo phiếu kho |
| `admin` | + Duyệt phiếu, hủy duyệt, quản lý danh mục, Admin panel |

`canUsePOS = role === 'staff' || role === 'admin'`
