import { Link, Navigate } from 'react-router-dom';
import {
  Package, ClipboardList, LogOut, Users,
  TrendingUp, ShoppingCart, ArrowUpRight,
  BarChart2, AlertTriangle, Truck, Palette,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Card điều hướng nhanh
function NavCard({ to, icon: Icon, label, desc, color }) {
  return (
    <Link to={to}
      className={`flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
      </div>
      <ArrowUpRight size={16} className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
    </Link>
  );
}

// Stat box đơn giản
function StatBox({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function Admin() {
  const { user, logout } = useAuth();

  // Chỉ admin mới vào được trang này
  if (!user) return <Navigate to="/tai-khoan?redirect=admin" replace />;
  if (user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Chỉ dành cho Admin</h2>
        <p className="text-sm text-gray-500 mb-5">Tài khoản của bạn không có quyền truy cập trang quản trị.</p>
        <Link to="/" className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-colors">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>›</span>
        <span className="text-primary font-medium">Quản trị</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Trang quản trị</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Xin chào, <strong>{user.name}</strong> — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={logout}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg px-3 py-2 transition-colors">
          <LogOut size={13} /> Đăng xuất
        </button>
      </div>

      {/* Stat overview — dữ liệu tĩnh demo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBox label="Đơn POS hôm nay" value="12" sub="↑ 3 so với hôm qua" color="text-primary" />
        <StatBox label="Doanh thu hôm nay" value="4.2M" sub="Đơn vị: VND" color="text-green-600" />
        <StatBox label="Sản phẩm sắp hết" value="5" sub="Tồn dưới 10 đơn vị" color="text-amber-600" />
        <StatBox label="Lô sắp hết hạn" value="3" sub="Trong vòng 30 ngày" color="text-red-600" />
      </div>

      {/* Điều hướng nhanh */}
      <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Quản lý nghiệp vụ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <NavCard to="/pos" icon={ShoppingCart} label="Bán lẻ tại quầy (POS)"
          desc="Tạo đơn, quét barcode, in hóa đơn" color="bg-primary" />
        <NavCard to="/pos/orders" icon={ClipboardList} label="Lịch sử đơn POS"
          desc="Xem, sửa, xuất hóa đơn đã tạo" color="bg-teal-500" />
        <NavCard to="/kho/ton-kho" icon={Package} label="Tồn kho"
          desc="Tra cứu tồn theo lô, cảnh báo hết hạn" color="bg-blue-500" />
        <NavCard to="/kho/nhap" icon={Truck} label="Nhập kho"
          desc="Tạo và duyệt phiếu nhập từ NCC" color="bg-indigo-500" />
        <NavCard to="/kho/xuat" icon={TrendingUp} label="Xuất kho"
          desc="Xuất hàng hỏng, hết hạn, nội bộ" color="bg-orange-500" />
        <NavCard to="/kho/luan-chuyen" icon={BarChart2} label="Luân chuyển kho"
          desc="Chuyển hàng giữa các chi nhánh" color="bg-purple-500" />
      </div>

      <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Quản lý hệ thống</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard to="/danh-muc/san-pham" icon={Package} label="Danh mục sản phẩm"
          desc="Xem toàn bộ sản phẩm trên website" color="bg-gray-500" />
        <NavCard to="/tai-khoan" icon={Users} label="Tài khoản"
          desc="Thông tin tài khoản quản trị" color="bg-gray-600" />
        <NavCard to="/admin/giao-dien" icon={Palette} label="Thiết kế giao diện"
          desc="Tùy chỉnh màu sắc, nút, header, footer" color="bg-pink-500" />
      </div>
    </div>
  );
}
