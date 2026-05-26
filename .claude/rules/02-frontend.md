# Kiến trúc Frontend (FE/)

**Tech stack**: React 19 · Vite 8 · Tailwind CSS 3 · React Router DOM 7 · Axios · Lucide React

```
FE/src/
├── pages/          # Các trang (route-level)
├── components/     # UI components tái sử dụng
├── context/        # React Context (AuthContext, CartContext)
├── hooks/          # Custom hooks
├── data/           # Mock data (tạm thời — sẽ thay bằng API)
└── constants/      # Hằng số dùng chung (shipping.js...)
```

## State management

- **AuthContext** (`context/AuthContext.jsx`): đăng nhập/đăng ký/đăng xuất, lưu vào `localStorage` key `hadua_auth_user`, kiểm tra quyền `canUsePOS`
- **CartContext** (`context/CartContext.jsx`): giỏ hàng in-memory (không persist), addToCart / removeFromCart / updateQty / clearCart

## Route guard

- Redirect về `/tai-khoan` nếu chưa đăng nhập hoặc thiếu quyền `canUsePOS` (role `staff` | `admin`)

## Mock data & constants

- `data/mockData.js`: sản phẩm (12 mẫu), danh mục (6 nhóm), thương hiệu, testimonial, tin tức, cửa hàng, tài khoản demo
- `data/mockPOSOrders.js`: đơn bán lẻ mẫu (8 đơn), `ORDER_STATUS`, `canEditOrder()`
- `data/mockInventory.js`: lô hàng mẫu, `BATCH_STATUS`, `initialExportReasons`, số phiếu NK/XK/LC
- `constants/shipping.js`: hằng số phí vận chuyển

## Tài khoản demo

| Username | Password | Vai trò |
|---|---|---|
| `admin` | `admin123` | Admin |
| `nhanvien` | `nv123` | Nhân viên |
| `nhanvien2` | `nv123` | Nhân viên |
| `khachhang1` | `kh123` | Khách hàng |
| `khachhang2` | `kh123` | Khách hàng |

## Màu sắc & theme (tailwind.config.js)

- **primary**: `#00a651` (xanh y tế) — nền nhạt: `#e8f5ee`
- **secondary**: `#f26522` (cam — CTA, highlight)
- **Font**: Roboto

## Routes đã xây dựng

| Route | File | Ghi chú |
|---|---|---|
| `/` | `pages/Home.jsx` | Banner slider, sản phẩm nổi bật, testimonial, tin tức |
| `/san-pham` | `pages/Products.jsx` | Lọc danh mục/giá/Rx, sắp xếp, phân trang |
| `/san-pham/:slug` | `pages/ProductDetail.jsx` | Upload toa bác sĩ (Rx), thêm giỏ hàng |
| `/gio-hang` | `pages/Cart.jsx` | |
| `/dat-hang` | `pages/Checkout.jsx` | COD / chuyển khoản |
| `/tai-khoan` | `pages/Account.jsx` | Login / register / profile |
| `/pos` | `pages/POS.jsx` | Quét barcode, tạo đơn, in hóa đơn |
| `/pos/orders` | `pages/POSOrders.jsx` | Lịch sử đơn, sửa pending, xuất hóa đơn |
| `/tin-tuc` | `pages/News.jsx` | |
| `/tin-tuc/:slug` | `pages/News.jsx` | |
| `/he-thong-cua-hang` | `pages/Stores.jsx` | Google Maps placeholder |
| `/lien-he` | `pages/Contact.jsx` | |
| `/quan-ly-kho` | `pages/Inventory.jsx` | Hub quản lý kho — 6 tab |
| `/gioi-thieu` | — | Placeholder |
| `/chinh-sach-dai-ly` | — | Placeholder |
| `/tuyen-dung` | — | Placeholder |

## Components chính

| File | Chức năng |
|---|---|
| `Header.jsx` | Logo, search, giỏ hàng badge, dropdown tài khoản + role badge, hamburger mobile |
| `Footer.jsx` | 4 cột: thông tin công ty, liên kết nhanh, chính sách, liên hệ |
| `Sidebar.jsx` | Cây danh mục collapsible, hotline 1900-0062 |
| `ProductCard.jsx` | Card sản phẩm — badge Rx, badge khuyến mãi, nút thêm giỏ |
| `FloatingButtons.jsx` | Nút cố định góc phải: Zalo, Facebook, Hotline (ẩn trên `/pos`) |
| `ConfirmDialog.jsx` | Dialog xác nhận tái sử dụng |
