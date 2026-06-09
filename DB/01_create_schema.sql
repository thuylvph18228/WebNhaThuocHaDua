-- ============================================================
-- NHÀ THUỐC HÀ ĐUA — Script tạo CSDL
-- SQL Server 2019
-- Quy ước:
--   - Tên bảng / cột: tiếng Việt không dấu, snake_case
--   - Khóa chính:     INT IDENTITY(1,1)
--   - Trạng thái hiển thị / hoạt động: BIT (1 = có, 0 = không)
--   - Mọi bảng có cột ngay_tao DATETIME DEFAULT GETDATE()
-- ============================================================

USE master;
GO

IF DB_ID('NhaThuocHaDua') IS NOT NULL
BEGIN
    ALTER DATABASE NhaThuocHaDua SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE NhaThuocHaDua;
END
GO

CREATE DATABASE NhaThuocHaDua
    COLLATE Vietnamese_CI_AS;
GO

USE NhaThuocHaDua;
GO

-- ============================================================
-- 1. DANH MỤC SẢN PHẨM (tự tham chiếu để hỗ trợ danh mục cha/con)
-- ============================================================
CREATE TABLE danh_muc (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    ten         NVARCHAR(150) NOT NULL,
    slug        NVARCHAR(150) NOT NULL UNIQUE,
    bieu_tuong  NVARCHAR(20)  NULL,                          -- emoji icon
    cha_id      INT           NULL REFERENCES danh_muc(id),  -- NULL = danh mục gốc
    thu_tu      INT           NOT NULL DEFAULT 0,
    hien_thi    BIT           NOT NULL DEFAULT 1,
    ngay_tao    DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 2. THƯƠNG HIỆU
-- ============================================================
CREATE TABLE thuong_hieu (
    id        INT           IDENTITY(1,1) PRIMARY KEY,
    ten       NVARCHAR(100) NOT NULL,
    logo      NVARCHAR(500) NULL,
    hien_thi  BIT           NOT NULL DEFAULT 1,
    ngay_tao  DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 3. SẢN PHẨM
-- ============================================================
CREATE TABLE san_pham (
    id                  INT             IDENTITY(1,1) PRIMARY KEY,
    maview              NVARCHAR(50)    NOT NULL UNIQUE,  -- mã barcode nội bộ
    ten                 NVARCHAR(300)   NOT NULL,
    slug                NVARCHAR(300)   NOT NULL UNIQUE,
    gia_ban             DECIMAL(18,0)   NOT NULL,
    gia_goc             DECIMAL(18,0)   NULL,             -- giá trước khuyến mãi
    hinh_anh            NVARCHAR(500)   NULL,
    danh_muc_id         INT             NULL REFERENCES danh_muc(id),
    thuong_hieu_id      INT             NULL REFERENCES thuong_hieu(id),
    mo_ta               NVARCHAR(MAX)   NULL,
    hoat_chat           NVARCHAR(300)   NULL,             -- active ingredient
    ham_luong           NVARCHAR(200)   NULL,             -- concentration/dosage
    duong_dung          NVARCHAR(100)   NULL,             -- route of administration
    don_vi_tinh         NVARCHAR(50)    NULL,             -- đơn vị tính (hộp, chai, cái…)
    nha_san_xuat        NVARCHAR(200)   NULL,
    xuat_xu             NVARCHAR(100)   NULL,
    so_dang_ky          NVARCHAR(50)    NULL,             -- số đăng ký dược
    la_ke_don           BIT             NOT NULL DEFAULT 0,  -- 1 = thuốc kê đơn (Rx)
    nhan                NVARCHAR(50)    NULL,             -- badge: 'Bán chạy', 'Mới', 'Khuyến mãi', 'Rx'
    danh_gia_trung_binh DECIMAL(3,1)    NULL DEFAULT 0,
    luot_danh_gia       INT             NOT NULL DEFAULT 0,
    hien_thi            BIT             NOT NULL DEFAULT 1,
    ngay_tao            DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 4. NGƯỜI DÙNG (admin / staff / customer)
-- ============================================================
CREATE TABLE nguoi_dung (
    id            INT           IDENTITY(1,1) PRIMARY KEY,
    ten_dang_nhap NVARCHAR(50)  NOT NULL UNIQUE,
    mat_khau      NVARCHAR(256) NOT NULL,  -- lưu hash (bcrypt/argon2) trong thực tế
    ho_ten        NVARCHAR(100) NOT NULL,
    email         NVARCHAR(150) NULL UNIQUE,
    dien_thoai    NVARCHAR(20)  NULL,
    dia_chi       NVARCHAR(300) NULL,
    -- vai trò: 'admin' | 'staff' | 'customer'
    vai_tro       NVARCHAR(20)  NOT NULL DEFAULT 'customer'
                  CHECK (vai_tro IN ('admin', 'staff', 'customer')),
    avatar        NVARCHAR(500) NULL,
    hoat_dong     BIT           NOT NULL DEFAULT 1,  -- 0 = khoá tài khoản
    ngay_tao      DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 5. NHÀ CUNG CẤP
-- ============================================================
CREATE TABLE nha_cung_cap (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    ten         NVARCHAR(200) NOT NULL,
    dia_chi     NVARCHAR(300) NULL,
    dien_thoai  NVARCHAR(20)  NULL,
    email       NVARCHAR(150) NULL,
    ghi_chu     NVARCHAR(500) NULL,
    hoat_dong   BIT           NOT NULL DEFAULT 1,
    ngay_tao    DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 6. KHO HÀNG
-- ============================================================
CREATE TABLE kho_hang (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    ten         NVARCHAR(100) NOT NULL,
    mo_ta       NVARCHAR(300) NULL,
    hoat_dong   BIT           NOT NULL DEFAULT 1,
    ngay_tao    DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 7. LÔ HÀNG (batch — đơn vị tồn kho cơ bản)
-- ============================================================
CREATE TABLE lo_hang (
    id                  INT             IDENTITY(1,1) PRIMARY KEY,
    ma_lo               NVARCHAR(50)    NOT NULL,      -- mã lô (nhà SX hoặc tự tạo)
    san_pham_id         INT             NOT NULL REFERENCES san_pham(id),
    kho_id              INT             NOT NULL REFERENCES kho_hang(id),
    so_luong_nhap       INT             NOT NULL,      -- số lượng ban đầu
    ton_hien_tai        INT             NOT NULL,      -- tồn thực tế (giảm khi xuất/bán)
    nguong_canh_bao     INT             NOT NULL DEFAULT 10,  -- ngưỡng cảnh báo sắp hết
    han_su_dung         DATE            NOT NULL,
    ngay_san_xuat       DATE            NULL,
    gia_nhap            DECIMAL(18,0)   NOT NULL,
    nha_cung_cap_id     INT             NULL REFERENCES nha_cung_cap(id),
    ghi_chu             NVARCHAR(500)   NULL,
    ngay_nhap           DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    hoat_dong           BIT             NOT NULL DEFAULT 1,
    ngay_tao            DATETIME        NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_lo_hang UNIQUE (san_pham_id, ma_lo, kho_id)
);
GO

-- ============================================================
-- 8. LÝ DO NHẬP KHO
-- ============================================================
CREATE TABLE ly_do_nhap (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    ten         NVARCHAR(100) NOT NULL,
    can_hoa_don BIT           NOT NULL DEFAULT 0,  -- 1 = bắt buộc nhập số hóa đơn
    hoat_dong   BIT           NOT NULL DEFAULT 1,
    ngay_tao    DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 9. LÝ DO XUẤT KHO
-- ============================================================
CREATE TABLE ly_do_xuat (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    ten         NVARCHAR(100) NOT NULL,
    hoat_dong   BIT           NOT NULL DEFAULT 1,
    ngay_tao    DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 10. PHIẾU NHẬP KHO
-- ============================================================
CREATE TABLE phieu_nhap (
    id                INT           IDENTITY(1,1) PRIMARY KEY,
    so_phieu          NVARCHAR(20)  NOT NULL UNIQUE,  -- NK26XXXXXX
    ly_do_nhap_id     INT           NOT NULL REFERENCES ly_do_nhap(id),
    ngay_nhap         DATE          NOT NULL,
    nha_cung_cap_id   INT           NULL REFERENCES nha_cung_cap(id),
    kho_nhap_id       INT           NOT NULL REFERENCES kho_hang(id),
    nguoi_giao        NVARCHAR(100) NULL,
    nguoi_nhan        NVARCHAR(100) NULL,
    ma_hoa_don        NVARCHAR(50)  NULL,
    so_hoa_don        NVARCHAR(50)  NULL,
    ngay_hoa_don      DATE          NULL,
    ghi_chu           NVARCHAR(500) NULL,
    da_duyet          BIT           NOT NULL DEFAULT 0,
    ngay_duyet        DATETIME      NULL,
    nguoi_duyet_id    INT           NULL REFERENCES nguoi_dung(id),
    nguoi_tao_id      INT           NOT NULL REFERENCES nguoi_dung(id),
    ngay_tao          DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE chi_tiet_phieu_nhap (
    id              INT             IDENTITY(1,1) PRIMARY KEY,
    phieu_nhap_id   INT             NOT NULL REFERENCES phieu_nhap(id),
    san_pham_id     INT             NOT NULL REFERENCES san_pham(id),
    ma_lo           NVARCHAR(50)    NOT NULL,      -- mã lô sẽ được tạo khi duyệt
    so_luong        INT             NOT NULL,
    gia_nhap        DECIMAL(18,0)   NOT NULL,
    han_su_dung     DATE            NOT NULL,
    ngay_san_xuat   DATE            NULL,
    ghi_chu         NVARCHAR(300)   NULL
);
GO

-- ============================================================
-- 11. PHIẾU XUẤT KHO
-- ============================================================
CREATE TABLE phieu_xuat (
    id              INT           IDENTITY(1,1) PRIMARY KEY,
    so_phieu        NVARCHAR(20)  NOT NULL UNIQUE,  -- XK26XXXXXX
    ly_do_xuat_id   INT           NOT NULL REFERENCES ly_do_xuat(id),
    kho_xuat_id     INT           NOT NULL REFERENCES kho_hang(id),
    ngay_xuat       DATE          NOT NULL,
    ghi_chu         NVARCHAR(500) NULL,
    da_duyet        BIT           NOT NULL DEFAULT 0,
    ngay_duyet      DATETIME      NULL,
    nguoi_duyet_id  INT           NULL REFERENCES nguoi_dung(id),
    nguoi_tao_id    INT           NOT NULL REFERENCES nguoi_dung(id),
    ngay_tao        DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE chi_tiet_phieu_xuat (
    id              INT           IDENTITY(1,1) PRIMARY KEY,
    phieu_xuat_id   INT           NOT NULL REFERENCES phieu_xuat(id),
    lo_hang_id      INT           NOT NULL REFERENCES lo_hang(id),
    so_luong        INT           NOT NULL,
    ghi_chu         NVARCHAR(300) NULL
);
GO

-- ============================================================
-- 12. PHIẾU LUÂN CHUYỂN KHO
-- ============================================================
CREATE TABLE phieu_luan_chuyen (
    id              INT           IDENTITY(1,1) PRIMARY KEY,
    so_phieu        NVARCHAR(20)  NOT NULL UNIQUE,  -- LC26XXXXXX
    kho_xuat_id     INT           NOT NULL REFERENCES kho_hang(id),
    kho_nhap_id     INT           NOT NULL REFERENCES kho_hang(id),
    ngay_chuyen     DATE          NOT NULL,
    ghi_chu         NVARCHAR(500) NULL,
    da_duyet        BIT           NOT NULL DEFAULT 0,
    ngay_duyet      DATETIME      NULL,
    nguoi_duyet_id  INT           NULL REFERENCES nguoi_dung(id),
    nguoi_tao_id    INT           NOT NULL REFERENCES nguoi_dung(id),
    ngay_tao        DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CK_luan_chuyen_kho CHECK (kho_xuat_id <> kho_nhap_id)
);
GO

CREATE TABLE chi_tiet_phieu_luan_chuyen (
    id                    INT           IDENTITY(1,1) PRIMARY KEY,
    phieu_luan_chuyen_id  INT           NOT NULL REFERENCES phieu_luan_chuyen(id),
    lo_hang_id            INT           NOT NULL REFERENCES lo_hang(id),
    so_luong              INT           NOT NULL,
    ghi_chu               NVARCHAR(300) NULL
);
GO

-- ============================================================
-- 13. ĐƠN HÀNG POS (bán lẻ tại quầy)
-- ============================================================
CREATE TABLE don_hang_pos (
    id                INT             IDENTITY(1,1) PRIMARY KEY,
    so_don            NVARCHAR(20)    NOT NULL UNIQUE,  -- POS-YYYYNNNN
    -- trạng thái: 'pending' | 'invoiced' | 'cancelled'
    trang_thai        NVARCHAR(20)    NOT NULL DEFAULT 'pending'
                      CHECK (trang_thai IN ('pending', 'invoiced', 'cancelled')),
    ten_khach         NVARCHAR(100)   NOT NULL,
    ngay_sinh         DATE            NULL,
    gioi_tinh         NVARCHAR(10)    NULL,
    dien_thoai        NVARCHAR(20)    NULL,
    dia_chi           NVARCHAR(300)   NULL,
    bac_si            NVARCHAR(100)   NULL,
    chan_doan         NVARCHAR(300)   NULL,
    nhan_vien_id      INT             NOT NULL REFERENCES nguoi_dung(id),
    tong_tien         DECIMAL(18,0)   NOT NULL DEFAULT 0,
    ghi_chu           NVARCHAR(500)   NULL,
    ngay_xuat_hoa_don DATETIME        NULL,
    ngay_tao          DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE chi_tiet_don_hang_pos (
    id            INT             IDENTITY(1,1) PRIMARY KEY,
    don_hang_id   INT             NOT NULL REFERENCES don_hang_pos(id),
    san_pham_id   INT             NOT NULL REFERENCES san_pham(id),
    lo_hang_id    INT             NULL REFERENCES lo_hang(id),  -- lô được xuất (FEFO)
    so_luong      INT             NOT NULL,
    don_gia       DECIMAL(18,0)   NOT NULL,
    thanh_tien    AS (so_luong * don_gia) PERSISTED  -- cột tính toán, lưu vật lý
);
GO

-- ============================================================
-- 14. ĐƠN HÀNG ONLINE (thương mại điện tử)
-- ============================================================
CREATE TABLE don_hang_online (
    id                    INT             IDENTITY(1,1) PRIMARY KEY,
    ma_don                NVARCHAR(30)    NOT NULL UNIQUE,
    khach_hang_id         INT             NULL REFERENCES nguoi_dung(id),  -- NULL = khách vãng lai
    ten_nguoi_nhan        NVARCHAR(100)   NOT NULL,
    dien_thoai            NVARCHAR(20)    NOT NULL,
    dia_chi_giao          NVARCHAR(300)   NOT NULL,
    tinh_thanh            NVARCHAR(100)   NULL,
    -- phuong thuc: 'cod' | 'bank_transfer'
    phuong_thuc_tt        NVARCHAR(20)    NOT NULL DEFAULT 'cod'
                          CHECK (phuong_thuc_tt IN ('cod', 'bank_transfer')),
    -- trang thai: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
    trang_thai            NVARCHAR(20)    NOT NULL DEFAULT 'pending'
                          CHECK (trang_thai IN ('pending','confirmed','shipping','delivered','cancelled')),
    tong_tien             DECIMAL(18,0)   NOT NULL DEFAULT 0,
    phi_van_chuyen        DECIMAL(18,0)   NOT NULL DEFAULT 0,
    tong_cong             DECIMAL(18,0)   NOT NULL DEFAULT 0,
    ghi_chu               NVARCHAR(500)   NULL,
    ngay_tao              DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE chi_tiet_don_hang_online (
    id            INT             IDENTITY(1,1) PRIMARY KEY,
    don_hang_id   INT             NOT NULL REFERENCES don_hang_online(id),
    san_pham_id   INT             NOT NULL REFERENCES san_pham(id),
    so_luong      INT             NOT NULL,
    don_gia       DECIMAL(18,0)   NOT NULL,
    thanh_tien    AS (so_luong * don_gia) PERSISTED
);
GO

-- ============================================================
-- 15. TOA THUỐC (đính kèm đơn hàng online khi mua Rx)
-- ============================================================
CREATE TABLE toa_thuoc (
    id              INT           IDENTITY(1,1) PRIMARY KEY,
    don_hang_id     INT           NOT NULL REFERENCES don_hang_online(id),
    ten_bac_si      NVARCHAR(100) NULL,
    so_toa          NVARCHAR(50)  NULL,
    ngay_ke         DATE          NULL,
    hinh_anh        NVARCHAR(500) NOT NULL,  -- URL file upload
    da_xac_nhan     BIT           NOT NULL DEFAULT 0,  -- 1 = dược sĩ đã xác nhận
    ngay_tao        DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 16. TIN TỨC / BÀI VIẾT
-- ============================================================
CREATE TABLE tin_tuc (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    tieu_de     NVARCHAR(300) NOT NULL,
    slug        NVARCHAR(300) NOT NULL UNIQUE,
    tom_tat     NVARCHAR(MAX) NULL,
    noi_dung    NVARCHAR(MAX) NULL,
    hinh_anh    NVARCHAR(500) NULL,
    danh_muc    NVARCHAR(100) NULL,  -- 'Sức khỏe', 'Dinh dưỡng', 'Hướng dẫn'…
    ngay_dang   DATE          NULL,
    tac_gia_id  INT           NULL REFERENCES nguoi_dung(id),
    hien_thi    BIT           NOT NULL DEFAULT 1,
    ngay_tao    DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 17. CỬA HÀNG
-- ============================================================
CREATE TABLE cua_hang (
    id          INT             IDENTITY(1,1) PRIMARY KEY,
    ten         NVARCHAR(200)   NOT NULL,
    dia_chi     NVARCHAR(300)   NOT NULL,
    dien_thoai  NVARCHAR(20)    NULL,
    gio_mo_cua  NVARCHAR(50)    NULL,
    vi_do       DECIMAL(10,8)   NULL,
    kinh_do     DECIMAL(11,8)   NULL,
    hoat_dong   BIT             NOT NULL DEFAULT 1,
    ngay_tao    DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 18. BANNER TRANG CHỦ
-- ============================================================
CREATE TABLE banner (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    tieu_de     NVARCHAR(200) NOT NULL,
    mo_ta       NVARCHAR(300) NULL,
    hinh_anh    NVARCHAR(500) NULL,
    mau_nen     NVARCHAR(20)  NULL,   -- hex color, vd: '#e8f5ee'
    duong_dan   NVARCHAR(300) NULL,   -- link khi click
    thu_tu      INT           NOT NULL DEFAULT 0,
    hien_thi    BIT           NOT NULL DEFAULT 1,
    ngay_tao    DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 19. COUNTER SỐ PHIẾU (NK / XK / LC)
--     Thay thế biến in-memory trong JS mock — lưu vào DB để tránh trùng
-- ============================================================
CREATE TABLE so_phieu_counter (
    loai        NCHAR(2)  NOT NULL,   -- 'NK' | 'XK' | 'LC'
    nam         SMALLINT  NOT NULL,
    so_hien_tai INT       NOT NULL DEFAULT 0,
    CONSTRAINT PK_so_phieu_counter PRIMARY KEY (loai, nam)
);
GO

-- ============================================================
-- INDEX hỗ trợ truy vấn thường gặp
-- ============================================================
CREATE INDEX IX_san_pham_danh_muc  ON san_pham (danh_muc_id);
CREATE INDEX IX_san_pham_thuong_hieu ON san_pham (thuong_hieu_id);
CREATE INDEX IX_lo_hang_san_pham    ON lo_hang (san_pham_id, han_su_dung);  -- FEFO
CREATE INDEX IX_lo_hang_kho         ON lo_hang (kho_id);
CREATE INDEX IX_don_hang_pos_nv     ON don_hang_pos (nhan_vien_id, ngay_tao);
CREATE INDEX IX_don_hang_pos_ngay   ON don_hang_pos (ngay_tao DESC);
CREATE INDEX IX_don_hang_online_kh  ON don_hang_online (khach_hang_id);
CREATE INDEX IX_tin_tuc_ngay        ON tin_tuc (ngay_dang DESC);
GO
