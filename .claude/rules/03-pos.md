# Tính năng POS — Bán lẻ tại quầy

Route `/pos` — chỉ dành cho **staff** và **admin**.

**Luồng:** Quét barcode / tìm kiếm → thêm thuốc vào đơn → điền thông tin khách → Thanh toán → xem trước hóa đơn → in/xuất PDF

## Thông tin cuống phiếu

| Trường | Bắt buộc |
|---|---|
| Tên khách hàng | **Có** |
| Địa chỉ, ngày sinh, giới tính, điện thoại | Không |
| Bác sĩ kê đơn, chẩn đoán | Không |
| Người bán | Tự động (tài khoản đăng nhập) |
| Ngày bán | Tự động (thời gian hệ thống) |

## Trạng thái đơn POS

`PENDING` → `INVOICED` | `CANCELLED`
- Admin: sửa mọi đơn đang PENDING
- Staff: chỉ sửa đơn của chính mình

## Tìm thuốc / quét barcode

- Tìm theo tên hoặc `maview` (mã barcode riêng mỗi sản phẩm, VD: `PANA24`)
- Khớp chính xác `maview` → tự động thêm vào đơn (giả lập máy quét)
- Dropdown kết quả: tên, giá, tồn kho

## Lịch sử đơn (`/pos/orders`)

- Filter: từ ngày → đến ngày (mặc định hôm nay), nhân viên (multi-select, admin only)
- Phân trang, sắp xếp theo ngày
- STT: `(page - 1) * pageSize + idx + 1`
