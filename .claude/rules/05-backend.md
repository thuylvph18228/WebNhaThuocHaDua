# Kiến trúc Backend (ASP.NET Core — chưa xây dựng)

Mô hình phân lớp:
- **Controllers/**: nhận request HTTP, không chứa logic nghiệp vụ
- **Services/**: logic nghiệp vụ
- **Repositories/** hoặc **Data/**: truy cập DB (Entity Framework Core)
- **Models/** / **Entities/**: entity ánh xạ với bảng DB
- **DTOs/**: object truyền dữ liệu giữa lớp / API
- **Program.cs**: entry point, cấu hình DI, middleware

## API POS cần xây dựng

```
GET  /api/pos/products/barcode/{code}  -- tìm thuốc theo barcode/maview
GET  /api/pos/products/search?q=       -- tìm kiếm thuốc
POST /api/pos/orders                   -- tạo đơn bán
GET  /api/pos/orders/{id}/invoice      -- xuất hóa đơn
```

## Quy ước BE

- Mỗi Controller chỉ xử lý một nhóm tài nguyên (thuốc, đơn hàng, khách hàng, toa bác sĩ...)
- Không để business logic trong Controller — chuyển vào Service
- API response nhất quán: `{ success: bool, data: T, message: string }`
- Tên bảng + cột DB dùng **tiếng Việt không dấu** (VD: `don_hang`, `san_pham`)
- Cột ID khóa chính: số tự nhiên **tăng tịnh tiến từ 1**
