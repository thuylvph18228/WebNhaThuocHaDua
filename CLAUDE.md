# CLAUDE.md — Nhà Thuốc Hà Đua

Tài liệu chi tiết được chia nhỏ trong `.claude/rules/`. Khi dùng `/init` để cập nhật tài liệu, hãy **bổ sung vào cả file rules tương ứng**, không chỉ file này.

## Index

| File | Nội dung |
|---|---|
| [`.claude/rules/01-project.md`](.claude/rules/01-project.md) | Tổng quan dự án, lệnh thường dùng |
| [`.claude/rules/02-frontend.md`](.claude/rules/02-frontend.md) | Kiến trúc FE, routes, components, mock data, tài khoản demo, theme |
| [`.claude/rules/03-pos.md`](.claude/rules/03-pos.md) | Tính năng POS — bán lẻ tại quầy |
| [`.claude/rules/04-inventory.md`](.claude/rules/04-inventory.md) | Tính năng quản lý kho (nhập/xuất/luân chuyển/tra cứu) |
| [`.claude/rules/05-backend.md`](.claude/rules/05-backend.md) | Kiến trúc Backend ASP.NET Core (chưa xây dựng) |
| [`.claude/rules/06-conventions.md`](.claude/rules/06-conventions.md) | Quy ước code, domain đặc thù nhà thuốc, phân quyền |

## Tóm tắt nhanh

- **Stack FE**: React 19 · Vite 8 · Tailwind CSS 3 · React Router DOM 7
- **Stack BE** (chưa có): ASP.NET Core · Entity Framework Core · SQL Server 2019
- **Dev**: `cd FE && npm run dev` → http://localhost:5173
- **Auth key**: `localStorage['hadua_auth_user']` — admin/admin123, nhanvien/nv123
- **Primary color**: `#00a651` · **Secondary**: `#f26522`
- **Kho**: tất cả nghiệp vụ theo lô hàng, FEFO, số phiếu NK/XK/LC + năm + 6 số

## Quy tắc khi dùng /init

Khi chạy `/init` để cập nhật tài liệu sau khi có thay đổi lớn:
1. Cập nhật **file rules tương ứng** trong `.claude/rules/` (không chỉ CLAUDE.md)
2. Cập nhật bảng routes trong `02-frontend.md` nếu thêm route mới
3. Cập nhật `04-inventory.md` nếu thêm tab/workflow kho mới
4. Cập nhật `05-backend.md` nếu thêm API spec mới
