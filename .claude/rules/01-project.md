# Tổng quan dự án

Web **Nhà Thuốc Hà Đua** — ứng dụng thương mại điện tử chuyên bán thuốc và các sản phẩm chăm sóc sức khỏe. Bố cục và giao diện tham khảo từ https://thietbiyte.sharekhoahoc.vn/. Gồm 3 thành phần:
- **FE/**: Frontend React — đã xây dựng xong phần lớn (mock data)
- **BE/**: Backend ASP.NET Core (Web API) — chưa tạo thư mục
- **DB/**: Script SQL / migration — SQL Server 2019 — chưa tạo thư mục

## Lệnh thường dùng

```bash
# Frontend (từ thư mục FE/)
cd FE && npm run dev        # http://localhost:5173
cd FE && npm run build
cd FE && npm run lint
```

```bash
# Backend (khi có)
dotnet run      # từ thư mục BE/
dotnet build
dotnet test
dotnet restore
```
