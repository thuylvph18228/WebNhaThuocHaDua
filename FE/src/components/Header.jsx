import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, User, Phone, Menu, X,
  ChevronDown, LogOut, MonitorCheck, Settings, ClipboardList, Package, LayoutList,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/mockData';

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout, canUsePOS } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/san-pham?q=${encodeURIComponent(searchQuery)}`);
  };

  const navLinks = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Sản phẩm', to: '/san-pham' },
    { label: 'Hệ thống cửa hàng', to: '/he-thong-cua-hang' },
    { label: 'Giới thiệu', to: '/gioi-thieu' },
    { label: 'Chính sách đại lý', to: '/chinh-sach-dai-ly' },
    { label: 'Tuyển dụng', to: '/tuyen-dung' },
    { label: 'Tin tức', to: '/tin-tuc' },
    { label: 'Liên hệ', to: '/lien-he' },
  ];

  // Badge vai trò
  const roleBadge = {
    admin: { label: 'Admin', cls: 'bg-red-100 text-red-600' },
    staff: { label: 'Nhân viên', cls: 'bg-blue-100 text-blue-600' },
    customer: { label: 'Khách hàng', cls: 'bg-gray-100 text-gray-600' },
  };

  return (
    <header className="w-full sticky top-0 z-50 shadow-md">
      {/* Thanh thông tin trên cùng */}
      <div className="bg-gray-700 text-gray-200 text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>📍 196 Nguyễn Doãn Chất, P.Quảng Phú, TP.Thanh Hóa</span>
            <span>|</span>
            <span>📞 0972201843</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-gray-400">Xin chào,</span>
                <span className="text-white font-medium">{user.name}</span>
                {/* Badge role */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roleBadge[user.role]?.cls}`}>
                  {roleBadge[user.role]?.label}
                </span>
                <span className="text-gray-600">|</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <LogOut size={12} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/tai-khoan" className="hover:text-white transition-colors flex items-center gap-1">
                  <User size={12} /> Đăng nhập
                </Link>
                <span>/</span>
                <Link to="/tai-khoan?tab=register" className="hover:text-white transition-colors">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header chính — nền trắng */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-white rounded-full flex flex-col items-center justify-center shadow-sm overflow-hidden">
                  <img
                    src="/img/logo.png"
                    alt="Logo Nhà Thuốc Hà Đua"
                    className="w-full h-full object-contain"
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML =
                        '<span class="text-white font-black text-lg leading-none">HĐ</span><span class="text-white/80 text-[8px] font-medium leading-none">NHÀ THUỐC</span>';
                    }}
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-gray-500 font-medium text-xs leading-tight uppercase tracking-wide">Nhà Thuốc</div>
                  <div className="text-primary font-black text-2xl leading-tight">HÀ ĐUA</div>
                  <div className="text-gray-400 text-[10px] leading-tight">Trao chất lượng – Giữ trọn niềm tin</div>
                </div>
              </div>
            </Link>

            {/* Thanh tìm kiếm */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="flex rounded-lg overflow-hidden border-2 border-primary">
                <select className="text-xs border-r border-gray-200 px-2 py-2 outline-none bg-gray-50 text-gray-600 hidden md:block">
                  <option>Tất cả</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name.split('(')[0].trim()}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Tìm kiếm thuốc, thực phẩm chức năng, thiết bị y tế..."
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white px-6 py-2.5 hover:bg-primary-dark transition-colors">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Hotline + Account dropdown + Cart */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Hotline 24/7</div>
                  <div className="font-black text-primary text-lg leading-tight">0972.201.843</div>
                </div>
              </div>

              {/* Tài khoản — có dropdown */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setAccountMenuOpen(o => !o)}
                  onBlur={() => setTimeout(() => setAccountMenuOpen(false), 150)}
                  className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
                >
                  <User size={22} />
                  <span className="text-xs mt-0.5 whitespace-nowrap">
                    {user ? user.name.split(' ').slice(-1)[0] : 'Tài khoản'}
                  </span>
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 min-w-[200px]">
                    {user ? (
                      <>
                        {/* Thông tin user */}
                        <div className="px-4 py-3 border-b bg-gray-50 rounded-t-lg">
                          <div className="font-semibold text-sm text-gray-800">{user.name}</div>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${roleBadge[user.role]?.cls}`}>
                            {roleBadge[user.role]?.label}
                          </span>
                        </div>

                        <Link
                          to="/tai-khoan"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={14} className="text-gray-400" />
                          Thông tin tài khoản
                        </Link>

                        {/* Nhóm quản lý — chỉ hiện với staff/admin */}
                        {canUsePOS && (
                          <>
                            <div className="px-4 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100">
                              Quản lý
                            </div>
                            <Link to="/pos"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors">
                              <MonitorCheck size={14} className="text-primary" />
                              Bán hàng tại quầy (POS)
                            </Link>
                            <Link to="/pos/orders"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors">
                              <ClipboardList size={14} className="text-primary" />
                              Lịch sử đơn bán
                            </Link>
                            <Link to="/quan-ly-kho"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors">
                              <Package size={14} className="text-primary" />
                              Quản lý kho
                            </Link>
                            {user.role === 'admin' && (
                              <Link to="/danh-muc/san-pham"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors">
                                <LayoutList size={14} className="text-primary" />
                                Quản lý danh mục
                              </Link>
                            )}
                          </>
                        )}

                        {/* Admin panel */}
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
                          >
                            <Settings size={14} />
                            Quản trị hệ thống
                          </Link>
                        )}

                        <button
                          onClick={() => { logout(); setAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 rounded-b-lg"
                        >
                          <LogOut size={14} />
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/tai-khoan"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
                        >
                          <User size={14} /> Đăng nhập
                        </Link>
                        <Link
                          to="/tai-khoan?tab=register"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary-light transition-colors rounded-b-lg border-t"
                        >
                          Đăng ký tài khoản
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Giỏ hàng */}
              <Link to="/gio-hang" className="flex flex-col items-center relative text-gray-600 hover:text-primary transition-colors">
                <div className="relative">
                  <ShoppingCart size={26} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5 hidden md:block">Giỏ hàng</span>
              </Link>

              <button className="md:hidden text-gray-600 p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar xanh */}
      <nav className="bg-primary hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center">
            {/* Danh mục dropdown */}
            <li className="relative group">
              <button className="flex items-center gap-1.5 text-white font-bold py-3 px-4 bg-green-800 hover:bg-green-900 transition-colors text-sm">
                <Menu size={15} />
                <span>DANH MỤC SẢN PHẨM</span>
                <ChevronDown size={13} />
              </button>
              <div className="absolute top-full left-0 bg-white shadow-xl z-50 min-w-[240px] hidden group-hover:block border-t-2 border-primary">
                {categories.map(cat => (
                  <div key={cat.id} className="relative group/sub">
                    <Link
                      to={`/san-pham?category=${cat.slug}`}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-light hover:text-primary border-b border-gray-100 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span><span>{cat.name}</span>
                      </span>
                      {cat.children?.length > 0 && <ChevronDown size={13} className="-rotate-90 text-gray-400" />}
                    </Link>
                    {cat.children?.length > 0 && (
                      <div className="absolute left-full top-0 bg-white shadow-lg min-w-[220px] hidden group-hover/sub:block border-t-2 border-primary z-50">
                        {cat.children.map(sub => (
                          <Link key={sub.id} to={`/san-pham?category=${sub.slug}`}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-light hover:text-primary border-b border-gray-100 transition-colors">
                            › {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </li>

            {navLinks.slice(1).map(link => (
              <li key={link.to}>
                <Link to={link.to} className="block text-white text-sm py-3 px-3 hover:bg-green-700 transition-colors font-medium whitespace-nowrap">
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Dropdown Quản lý — chỉ hiện với staff/admin */}
            {canUsePOS && (
              <li className="relative group border-l border-green-600 ml-1">
                <button className="flex items-center gap-1.5 text-white text-sm py-3 px-3 hover:bg-green-700 transition-colors font-medium whitespace-nowrap">
                  <Settings size={14} />
                  Quản lý
                  <ChevronDown size={12} className="group-hover:rotate-180 transition-transform" />
                </button>
                {/* Dropdown menu */}
                <div className="absolute top-full left-0 bg-white shadow-xl z-50 min-w-[210px] hidden group-hover:block border-t-2 border-primary rounded-b-lg overflow-hidden">
                  <div className="px-4 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bán lẻ tại quầy</div>
                  <Link to="/pos"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors">
                    <MonitorCheck size={14} className="text-primary" />
                    Bán hàng (POS)
                  </Link>
                  <Link to="/pos/orders"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors border-b border-gray-100">
                    <ClipboardList size={14} className="text-primary" />
                    Lịch sử đơn bán
                  </Link>
                  <div className="px-4 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kho hàng</div>
                  <Link to="/quan-ly-kho"
                    className="flex items-center gap-2.5 px-4 py-2 pb-3 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors">
                    <Package size={14} className="text-primary" />
                    Quản lý kho
                  </Link>
                </div>
              </li>
            )}

            {/* Dropdown Danh mục — chỉ admin */}
            {user?.role === 'admin' && (
              <li className="relative group border-l border-green-600">
                <button className="flex items-center gap-1.5 text-white text-sm py-3 px-3 hover:bg-green-700 transition-colors font-medium whitespace-nowrap">
                  <LayoutList size={14} />
                  Danh mục
                  <ChevronDown size={12} className="group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full left-0 bg-white shadow-xl z-50 min-w-[200px] hidden group-hover:block border-t-2 border-primary rounded-b-lg overflow-hidden">
                  {[
                    { to: '/danh-muc/san-pham', label: '💊 Sản phẩm' },
                    { to: '/danh-muc/ly-do-nhap', label: '📋 Lý do nhập' },
                    { to: '/danh-muc/ly-do-xuat', label: '📤 Lý do xuất' },
                    { to: '/danh-muc/nha-cung-cap', label: '🏢 Nhà cung cấp' },
                    { to: '/danh-muc/kho-hang', label: '🏭 Kho hàng' },
                  ].map((item, i, arr) => (
                    <Link key={item.to} to={item.to}
                      className={`flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors ${i === arr.length - 1 ? 'pb-3' : 'border-b border-gray-100'}`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </li>
            )}

            <li className="ml-auto">
              <Link to="/dat-hang"
                className="block bg-secondary text-white font-bold py-2 px-5 mx-2 my-2 rounded-sm hover:opacity-90 transition-opacity text-sm uppercase tracking-wide">
                ĐẶT HÀNG NGAY
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg max-h-96 overflow-y-auto">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className="block px-4 py-3 text-sm text-gray-700 border-b hover:bg-primary-light hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {canUsePOS && (
            <>
              <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                Quản lý
              </div>
              <Link to="/pos"
                className="flex items-center gap-2 px-4 py-3 text-sm text-primary font-semibold border-b bg-primary-light"
                onClick={() => setMobileMenuOpen(false)}>
                <MonitorCheck size={14} /> Bán hàng tại quầy (POS)
              </Link>
              <Link to="/pos/orders"
                className="flex items-center gap-2 px-4 py-3 text-sm text-primary border-b bg-primary-light"
                onClick={() => setMobileMenuOpen(false)}>
                <ClipboardList size={14} /> Lịch sử đơn bán
              </Link>
              <Link to="/quan-ly-kho"
                className="flex items-center gap-2 px-4 py-3 text-sm text-primary border-b bg-primary-light"
                onClick={() => setMobileMenuOpen(false)}>
                <Package size={14} /> Quản lý kho
              </Link>
              {user?.role === 'admin' && (
                <>
                  <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Danh mục</div>
                  {[
                    { to: '/danh-muc/san-pham', label: '💊 Sản phẩm' },
                    { to: '/danh-muc/ly-do-nhap', label: '📋 Lý do nhập' },
                    { to: '/danh-muc/ly-do-xuat', label: '📤 Lý do xuất' },
                    { to: '/danh-muc/nha-cung-cap', label: '🏢 Nhà cung cấp' },
                    { to: '/danh-muc/kho-hang', label: '🏭 Kho hàng' },
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-primary border-b bg-primary-light"
                      onClick={() => setMobileMenuOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}
