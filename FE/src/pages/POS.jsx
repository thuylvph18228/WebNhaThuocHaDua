import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Search, Trash2, Plus, Minus, Printer, X,
  CheckCircle, AlertCircle, Camera, User, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { lazy, Suspense } from 'react';
const BarcodeScanner = lazy(() => import('../components/BarcodeScanner'));

// Format tiền VND
function fmt(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

// Tìm sản phẩm theo maview — nhận products từ context
function findByBarcode(products, code) {
  const upper = code.trim().toUpperCase();
  return products.find(p => p.maview?.toUpperCase() === upper) || null;
}

// Tìm kiếm nhanh: tên, maview, hoạt chất, thương hiệu
function searchProducts(products, q) {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();
  return products
    .filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.maview?.toLowerCase().includes(lower) ||
      p.brand?.toLowerCase().includes(lower) ||
      p.activeIngredient?.toLowerCase().includes(lower)
    )
    .slice(0, 8);
}

const EMPTY_CUSTOMER = {
  name: '', address: '', dob: '', gender: '', phone: '', doctor: '', diagnosis: '',
};

const SCREEN = { ORDER: 'order', INVOICE: 'invoice', SUCCESS: 'success' };

// Chiều cao = 100vh - header MainLayout (~173px) - padding container trên dưới (~16px)
const POS_HEIGHT = 'calc(100vh - 189px)';

export default function POS() {
  const { user, canUsePOS } = useAuth();
  const { activeProducts: products } = useProducts();

  const [orderItems, setOrderItems] = useState([]);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef(null);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const [screen, setScreen] = useState(SCREEN.ORDER);
  const [orderId, setOrderId] = useState(null);
  const [toast, setToast] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [mobileTab, setMobileTab] = useState('order'); // 'order' | 'customer'

  const focusBarcode = useCallback(() => {
    setTimeout(() => barcodeRef.current?.focus(), 50);
  }, []);

  const focusSearch = useCallback(() => {
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  // Focus barcode một lần khi vào màn hình ORDER
  useEffect(() => {
    if (screen === SCREEN.ORDER && user) focusBarcode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, user]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = barcodeInput.trim();
      if (!code) return;
      const product = findByBarcode(products, code);
      if (product) {
        addToOrder(product);
        showToast(`✓ Đã thêm: ${product.name}`);
      } else {
        showToast(`Không tìm thấy mã: ${code}`, 'error');
      }
      setBarcodeInput('');
      focusBarcode();
    }
  };

  useEffect(() => {
    const results = searchProducts(products, searchQ);
    setSearchResults(results);
    setShowDropdown(results.length > 0 && searchQ.trim().length > 0);
  }, [searchQ, products]);

  const addToOrder = useCallback((product) => {
    // Không cho thêm sản phẩm đã hết tồn kho
    if (!product.stock || product.stock <= 0) {
      showToast('Sản phẩm này đã hết hàng', 'error');
      return;
    }
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        // Không vượt quá số lượng tồn kho hiện tại
        if (existing.qty >= product.stock) return prev;
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, [showToast]);

  // Xử lý kết quả từ camera scanner — đặt sau addToOrder để tránh TDZ
  const handleCameraDetected = useCallback((code) => {
    const product = findByBarcode(products, code);
    if (product) {
      addToOrder(product);
      showToast(`✓ Đã thêm: ${product.name}`);
      setMobileTab('order');
    } else {
      showToast(`Không tìm thấy mã: ${code}`, 'error');
    }
  }, [products, addToOrder, showToast]);

  const removeItem = useCallback((id) => {
    setOrderItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const changeQty = useCallback((id, delta) => {
    setOrderItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        // Giới hạn số lượng không vượt tồn kho
        const newQty = Math.min(i.qty + delta, i.stock ?? i.qty + delta);
        return { ...i, qty: newQty };
      }).filter(i => i.qty > 0)
    );
  }, []);

  const total = orderItems.reduce((s, i) => s + i.price * i.qty, 0);

  const cancelOrder = () => {
    // Đơn trống thì hủy ngay, đơn có hàng mới cần xác nhận
    if (orderItems.length === 0) {
      setOrderItems([]);
      setCustomer(EMPTY_CUSTOMER);
      focusBarcode();
    } else {
      setCancelConfirm(true);
    }
  };

  const doCancelOrder = () => {
    setCancelConfirm(false);
    setOrderItems([]);
    setCustomer(EMPTY_CUSTOMER);
    focusBarcode();
  };

  const handleCheckout = () => {
    if (orderItems.length === 0) { showToast('Đơn trống — thêm thuốc trước', 'error'); return; }
    if (!customer.name.trim()) { showToast('Vui lòng nhập tên khách hàng', 'error'); return; }
    setOrderId(`POS-${Date.now()}`);
    setScreen(SCREEN.INVOICE);
  };

  const confirmPayment = () => {
    setScreen(SCREEN.SUCCESS);
    setTimeout(() => {
      setScreen(SCREEN.ORDER);
      setOrderItems([]);
      setCustomer(EMPTY_CUSTOMER);
      setOrderId(null);
      focusBarcode();
    }, 2500);
  };

  // ─── Màn hình thanh toán thành công ──────────────────────────
  if (screen === SCREEN.SUCCESS) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle size={72} className="text-primary mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-gray-800 mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-500">Đơn {orderId} đã được lưu. Đang tạo đơn mới...</p>
      </div>
    );
  }

  // ─── Màn hình xem trước hóa đơn ──────────────────────────────
  if (screen === SCREEN.INVOICE) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-primary text-white p-5 text-center">
            <h2 className="font-black text-xl">NHÀ THUỐC HÀ ĐUA</h2>
            <p className="text-sm opacity-80">196 Nguyễn Doãn Chất, P.Quảng Phú, TP.Thanh Hóa | ĐT: 0972.201.843</p>
            <div className="mt-2 text-sm font-bold border border-white/40 inline-block px-3 py-0.5 rounded">
              PHIẾU BÁN LẺ — {orderId}
            </div>
          </div>
          <div className="p-5">
            {/* Thông tin khách hàng */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-4 pb-4 border-b">
              <div><span className="text-gray-500">Khách hàng:</span> <strong>{customer.name}</strong></div>
              <div><span className="text-gray-500">SĐT:</span> {customer.phone || '—'}</div>
              <div><span className="text-gray-500">Địa chỉ:</span> {customer.address || '—'}</div>
              <div><span className="text-gray-500">Giới tính:</span> {customer.gender || '—'}</div>
              {customer.doctor && <div><span className="text-gray-500">Bác sĩ:</span> {customer.doctor}</div>}
              {customer.diagnosis && <div className="col-span-2"><span className="text-gray-500">Chẩn đoán:</span> {customer.diagnosis}</div>}
              <div><span className="text-gray-500">Người bán:</span> <strong>{user.name}</strong></div>
              <div><span className="text-gray-500">Ngày bán:</span> {new Date().toLocaleString('vi-VN')}</div>
            </div>
            {/* Bảng thuốc */}
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <th className="text-left py-2 px-2">STT</th>
                  <th className="text-left py-2 px-2">Tên thuốc</th>
                  <th className="text-right py-2 px-2">Đơn giá</th>
                  <th className="text-right py-2 px-2">SL</th>
                  <th className="text-right py-2 px-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400 flex gap-1.5">
                        {item.maview && <code className="font-mono">{item.maview}</code>}
                        <span>{item.brand}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right">{fmt(item.price)}</td>
                    <td className="py-2 px-2 text-right font-bold">{item.qty}</td>
                    <td className="py-2 px-2 text-right font-bold text-primary">{fmt(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mb-5">
              <div className="text-right">
                <div className="text-gray-500 text-sm">Tổng cộng:</div>
                <div className="text-3xl font-black text-primary">{fmt(total)}</div>
              </div>
            </div>
            {/* Nút hành động */}
            <div className="flex gap-3 print:hidden">
              <button onClick={() => setScreen(SCREEN.ORDER)}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium">
                ← Quay lại sửa đơn
              </button>
              <button onClick={() => window.print()}
                className="flex-1 border border-primary text-primary py-2.5 rounded-lg hover:bg-primary-light text-sm font-medium flex items-center justify-center gap-2">
                <Printer size={16} /> In hóa đơn
              </button>
              <button onClick={confirmPayment}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark font-bold text-sm">
                ✓ Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Màn hình bán hàng chính ──────────────────────────────────
  return (<>
    <div className="container mx-auto px-4 pb-2">
    <div className="flex flex-col overflow-hidden rounded-lg shadow-sm" style={{ height: POS_HEIGHT }}>
      {/* Sub-header: breadcrumb + thông tin nhân viên */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>›</span>
          <span className="text-primary font-semibold">Bán hàng tại quầy (POS)</span>
        </div>
        {/* <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="hidden sm:block">{new Date().toLocaleString('vi-VN')}</span>
          <Link to="/pos/orders"
            className="flex items-center gap-1 text-primary hover:underline font-medium">
            <ClipboardList size={13} /> Lịch sử đơn
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-700">{user.name}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {user.role === 'admin' ? 'Admin' : 'Nhân viên'}
          </span>
        </div> */}
      </div>

      {/* Toast thông báo */}
      {toast && (
        <div className={`fixed top-48 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-primary'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Tab bar — chỉ hiện trên mobile */}
      <div className="flex md:hidden border-b bg-white flex-shrink-0">
        <button onClick={() => setMobileTab('order')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold border-b-2 transition-colors ${mobileTab === 'order' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
          <ShoppingBag size={15} />
          Đơn hàng
          {orderItems.length > 0 && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{orderItems.length}</span>
          )}
        </button>
        <button onClick={() => setMobileTab('customer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold border-b-2 transition-colors ${mobileTab === 'customer' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
          <User size={15} />
          Khách hàng
        </button>
      </div>

      {/* Layout 2 cột (desktop) / 1 cột (mobile) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ═══ CỘT TRÁI: Danh sách thuốc trong đơn ═══ */}
        <div className={`flex-col min-w-0 border-r border-gray-200 bg-gray-50 flex-1 ${mobileTab === 'order' ? 'flex' : 'hidden md:flex'}`}>
          {/* Thanh quét / tìm kiếm */}
          <div className="bg-white border-b p-2.5 flex gap-2 flex-shrink-0">
            {/* Nút camera — nổi bật trên mobile */}
            <button
              onClick={() => setShowScanner(true)}
              title="Quét mã vạch bằng camera"
              className="flex items-center justify-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-dark flex-shrink-0 text-sm font-medium"
            >
              <Camera size={16} />
              <span className="hidden sm:inline">Camera</span>
            </button>
            {/* Ô barcode — ẩn trên mobile nhỏ vì dùng camera */}
            <div className="flex-1 relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                placeholder="Nhập mã view (VD: PANA24), nhấn Enter..."
                className="w-full border-2 border-primary rounded-lg pl-9 pr-3 py-2 text-sm outline-none bg-green-50 font-medium placeholder-gray-400"
              />
            </div>
            {/* Tìm kiếm nhanh theo tên */}
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <input
                ref={searchRef}
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onFocus={() => searchQ && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Tìm theo tên thuốc..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border rounded-lg z-50 mt-1 max-h-64 overflow-y-auto">
                  {searchResults.map(p => (
                    <button
                      key={p.id}
                      onMouseDown={() => {
                        addToOrder(p);
                        setSearchQ('');
                        setShowDropdown(false);
                        showToast(`✓ Đã thêm: ${p.name}`);
                        setMobileTab('order');
                        focusSearch();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-light text-left border-b border-gray-50 last:border-0"
                    >
                      <img src={p.image} alt="" className="w-9 h-9 object-contain bg-gray-100 rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</div>
                        <div className="text-xs text-gray-400 flex gap-1.5">
                          {p.maview && <code className="bg-gray-100 px-1 rounded font-mono text-[10px]">{p.maview}</code>}
                          <span>{p.brand}</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary flex-shrink-0">{fmt(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bảng thuốc trong đơn */}
          <div className="flex-1 overflow-y-auto">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                <Search size={44} className="opacity-20" />
                <p className="text-sm">Quét barcode hoặc tìm kiếm để thêm thuốc</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 uppercase border-b">
                    <th className="text-left py-2 px-3 font-semibold">Thuốc / Mã view</th>
                    <th className="text-right py-2 px-3 font-semibold w-28">Đơn giá</th>
                    <th className="text-center py-2 px-3 font-semibold w-28">SL</th>
                    <th className="text-right py-2 px-3 font-semibold w-28">Thành tiền</th>
                    <th className="py-2 px-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, idx) => (
                    <tr key={item.id}
                      className={`border-b border-gray-100 hover:bg-white transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-primary-light text-primary text-xs flex items-center justify-center rounded-full font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-medium text-gray-800 line-clamp-1">{item.name}</div>
                            <div className="text-xs text-gray-400 flex gap-1.5">
                              {item.maview && (
                                <code className="bg-gray-100 text-gray-500 px-1 rounded text-[10px] font-mono">{item.maview}</code>
                              )}
                              <span>{item.brand}</span>
                              {item.isRx && <span className="text-red-500 font-bold">• Rx</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">{fmt(item.price)}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => changeQty(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-9 text-center font-bold">{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-green-50 hover:border-green-300 hover:text-primary transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-primary">{fmt(item.price * item.qty)}</td>
                      <td className="py-2 px-2 text-center">
                        <button onClick={() => removeItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer đơn */}
          <div className="bg-white border-t p-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">{orderItems.length}</span> loại ·{' '}
                <span className="font-semibold text-gray-800">{orderItems.reduce((s, i) => s + i.qty, 0)}</span> sản phẩm
              </span>
              <div className="text-right">
                <div className="text-xs text-gray-400">Tổng cộng</div>
                <div className="text-xl font-black text-primary">{fmt(total)}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={cancelOrder}
                className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <X size={14} /> Hủy đơn
              </button>
              {/* Desktop: thanh toán thẳng | Mobile: sang tab Khách hàng trước */}
              <button onClick={handleCheckout} disabled={orderItems.length === 0}
                className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark text-sm disabled:opacity-40 disabled:cursor-not-allowed items-center justify-center gap-2 hidden md:flex">
                <Printer size={15} /> Thanh toán — {fmt(total)}
              </button>
              <button onClick={() => { if (orderItems.length === 0) { showToast('Thêm thuốc vào đơn trước', 'error'); return; } setMobileTab('customer'); }}
                disabled={orderItems.length === 0}
                className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:hidden">
                Tiếp theo — Khách hàng →
              </button>
            </div>
          </div>
        </div>

        {/* ═══ CỘT PHẢI: Thông tin cuống phiếu ═══ */}
        <div className={`flex-col flex-shrink-0 bg-white overflow-hidden w-full md:w-72 xl:w-80 ${mobileTab === 'customer' ? 'flex' : 'hidden md:flex'}`}>
          <div className="bg-gray-700 text-white px-4 py-2.5 text-sm font-bold flex-shrink-0">
            Thông tin cuống phiếu
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <form className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tên khách hàng <span className="text-red-500">*</span>
                </label>
                <input type="text" value={customer.name}
                  onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
                  placeholder="Nhập tên bệnh nhân"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" value={customer.phone}
                  onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
                  placeholder="0912 345 678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày sinh</label>
                  <input type="date" value={customer.dob}
                    onChange={e => setCustomer(c => ({ ...c, dob: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giới tính</label>
                  <select value={customer.gender}
                    onChange={e => setCustomer(c => ({ ...c, gender: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary bg-white">
                    <option value="">—</option>
                    <option>Nam</option><option>Nữ</option><option>Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ</label>
                <input type="text" value={customer.address}
                  onChange={e => setCustomer(c => ({ ...c, address: e.target.value }))}
                  placeholder="Địa chỉ (không bắt buộc)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bác sĩ kê đơn</label>
                <input type="text" value={customer.doctor}
                  onChange={e => setCustomer(c => ({ ...c, doctor: e.target.value }))}
                  placeholder="Tên bác sĩ (nếu có toa)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Chẩn đoán</label>
                <textarea value={customer.diagnosis}
                  onChange={e => setCustomer(c => ({ ...c, diagnosis: e.target.value }))}
                  placeholder="Chẩn đoán bệnh (không bắt buộc)"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary resize-none" />
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-500 space-y-1 border border-gray-100">
                <div className="flex justify-between">
                  <span>Người bán:</span>
                  <span className="font-semibold text-gray-700">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ngày bán:</span>
                  <span className="font-semibold text-gray-700">{new Date().toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </form>
          </div>
          <div className="p-3 border-t bg-gray-50 flex-shrink-0">
            <div className="flex gap-2">
              <button onClick={() => setMobileTab('order')}
                className="border border-gray-300 text-gray-600 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium md:hidden">
                ← Đơn hàng
              </button>
              <button onClick={handleCheckout} disabled={orderItems.length === 0}
                className="flex-1 bg-primary text-white font-black py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                💳 Thanh toán{orderItems.length > 0 ? ` — ${fmt(total)}` : ''}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-1.5">
              {orderItems.length === 0 ? 'Thêm thuốc vào đơn trước' : `${orderItems.length} loại · ${fmt(total)}`}
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>

    {/* Camera barcode scanner — lazy loaded để không ảnh hưởng load ban đầu */}
    {showScanner && (
      <Suspense fallback={<div className="fixed inset-0 z-50 bg-black flex items-center justify-center text-white">Đang tải camera...</div>}>
        <BarcodeScanner
          onDetected={handleCameraDetected}
          onClose={() => setShowScanner(false)}
        />
      </Suspense>
    )}

    {/* Dialog xác nhận hủy đơn */}
    {cancelConfirm && (
      <ConfirmDialog
        message="Bạn có chắc muốn hủy đơn hiện tại?"
        onConfirm={doCancelOrder}
        onCancel={() => setCancelConfirm(false)}
      />
    )}
  </>);
}
