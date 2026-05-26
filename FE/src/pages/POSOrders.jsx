import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw, Eye, Edit2, X, ChevronDown,
  Printer, Save, Trash2, Plus, Minus, Search,
  CheckCircle, XCircle, Clock, MonitorCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { posOrders, ORDER_STATUS, canEditOrder } from '../data/mockPOSOrders';
import { users } from '../data/mockData';
import { useProducts } from '../context/ProductContext';

// ─── Helpers ────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}
function fmtDateOnly(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}
function toInputDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const STATUS_MAP = {
  [ORDER_STATUS.PENDING]:   { label: 'Chưa xuất HĐ', cls: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
  [ORDER_STATUS.INVOICED]:  { label: 'Đã xuất HĐ',   cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
  [ORDER_STATUS.CANCELLED]: { label: 'Đã hủy',        cls: 'bg-red-100 text-red-600',    icon: <XCircle size={12} /> },
};

// Danh sách nhân viên từ users (staff + admin)
const STAFF_LIST = users.filter(u => u.role === 'staff' || u.role === 'admin');

// ─── Multi-select dropdown nhân viên ─────────────────────────────
function StaffMultiSelect({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (username) => {
    onChange(
      selected.includes(username)
        ? selected.filter(s => s !== username)
        : [...selected, username]
    );
  };
  const toggleAll = () => onChange(selected.length === STAFF_LIST.length ? [] : STAFF_LIST.map(s => s.username));

  const label = selected.length === 0 || selected.length === STAFF_LIST.length
    ? 'Tất cả nhân viên'
    : STAFF_LIST.filter(s => selected.includes(s.username)).map(s => s.name.split(' ').pop()).join(', ');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-primary transition-colors min-w-[200px] justify-between"
      >
        <span className="truncate text-gray-700">{label}</span>
        <ChevronDown size={14} className={`flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 min-w-full">
          {/* Chọn tất cả */}
          <label className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
            <input
              type="checkbox"
              checked={selected.length === 0 || selected.length === STAFF_LIST.length}
              onChange={toggleAll}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-medium text-gray-700">Tất cả nhân viên</span>
          </label>
          {STAFF_LIST.map(s => (
            <label key={s.username} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(s.username)}
                onChange={() => toggle(s.username)}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <div className="text-sm text-gray-700">{s.name}</div>
                <div className="text-xs text-gray-400">{s.username}</div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal xem / sửa đơn ────────────────────────────────────────
function OrderModal({ order: initialOrder, mode: initialMode, user, onClose, onSave }) {
  const { activeProducts: products } = useProducts();
  const [mode, setMode] = useState(initialMode); // 'view' | 'edit'
  const [order, setOrder] = useState({ ...initialOrder, items: initialOrder.items.map(i => ({ ...i })) });
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [saved, setSaved] = useState(false);

  const editable = canEditOrder(initialOrder, user);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const q = searchQ.toLowerCase();
    setSearchResults(
      products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.maview?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [searchQ]);

  const addItem = (product) => {
    setOrder(o => {
      const existing = o.items.find(i => i.id === product.id);
      if (existing) return { ...o, items: o.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
      return { ...o, items: [...o.items, { ...product, qty: 1 }] };
    });
    setSearchQ('');
    setSearchResults([]);
  };
  const removeItem = (id) => setOrder(o => ({ ...o, items: o.items.filter(i => i.id !== id) }));
  const changeQty = (id, delta) => setOrder(o => ({
    ...o,
    items: o.items.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i),
  }));
  const setCustomer = (key, val) => setOrder(o => ({ ...o, customer: { ...o.customer, [key]: val } }));

  const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);

  const handleSave = () => {
    onSave({ ...order, total });
    setSaved(true);
    setTimeout(() => { setSaved(false); setMode('view'); }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-4">
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-800 text-base">{order.id}</h2>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[order.status]?.cls}`}>
              {STATUS_MAP[order.status]?.icon}
              {STATUS_MAP[order.status]?.label}
            </span>
            {mode === 'edit' && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Đang chỉnh sửa</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && editable && (
              <button onClick={() => setMode('edit')}
                className="flex items-center gap-1.5 text-sm border border-amber-400 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors font-medium">
                <Edit2 size={14} /> Sửa đơn
              </button>
            )}
            {mode === 'view' && (
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer size={14} /> In
              </button>
            )}
            {mode === 'edit' && (
              <>
                <button onClick={() => setMode('view')}
                  className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  Hủy sửa
                </button>
                <button onClick={handleSave}
                  className={`flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${
                    saved ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'
                  }`}>
                  {saved ? <><CheckCircle size={14} /> Đã lưu</> : <><Save size={14} /> Lưu</>}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Thông tin khách hàng */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Thông tin khách hàng</h3>
            {mode === 'view' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {[
                  ['Tên', order.customer.name],
                  ['Ngày sinh', fmtDateOnly(order.customer.dob)],
                  ['Giới tính', order.customer.gender || '—'],
                  ['Số điện thoại', order.customer.phone || '—'],
                  ['Địa chỉ', order.customer.address || '—'],
                  ['Bác sĩ', order.doctor || '—'],
                  ['Chẩn đoán', order.diagnosis || '—'],
                  ['Nhân viên bán', order.staffName],
                  ['Ngày bán', fmtDate(order.createdAt)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-400">{k}</div>
                    <div className="text-gray-800 font-medium mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { key: 'name', label: 'Tên khách hàng *', type: 'text' },
                  { key: 'phone', label: 'Số điện thoại', type: 'tel' },
                  { key: 'dob', label: 'Ngày sinh', type: 'date' },
                  { key: 'gender', label: 'Giới tính', type: 'select' },
                  { key: 'address', label: 'Địa chỉ', type: 'text', span: 2 },
                ].map(f => (
                  <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={order.customer[f.key]} onChange={e => setCustomer(f.key, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-primary bg-white">
                        <option value="">—</option>
                        <option>Nam</option><option>Nữ</option><option>Khác</option>
                      </select>
                    ) : (
                      <input type={f.type} value={order.customer[f.key]} onChange={e => setCustomer(f.key, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-primary" />
                    )}
                  </div>
                ))}
                {/* Bác sĩ / chẩn đoán */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bác sĩ kê đơn</label>
                  <input value={order.doctor} onChange={e => setOrder(o => ({ ...o, doctor: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Chẩn đoán</label>
                  <input value={order.diagnosis} onChange={e => setOrder(o => ({ ...o, diagnosis: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Danh sách thuốc */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Danh sách thuốc</h3>

            {/* Thêm thuốc (chỉ khi edit) */}
            {mode === 'edit' && (
              <div className="relative mb-2">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Tìm thuốc để thêm (tên, mã view)..."
                  className="w-full border border-dashed border-primary rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-primary bg-primary-light"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-lg border rounded-lg z-20 mt-1 max-h-48 overflow-y-auto">
                    {searchResults.map(p => (
                      <button key={p.id} onMouseDown={() => addItem(p)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-light text-left border-b last:border-0 text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-400 flex gap-1">
                            {p.maview && <code className="bg-gray-100 px-1 rounded font-mono">{p.maview}</code>}
                            <span>{p.brand}</span>
                          </div>
                        </div>
                        <span className="text-primary font-bold flex-shrink-0">{fmt(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                  <th className="text-left py-2 px-2">Thuốc</th>
                  <th className="text-right py-2 px-2 w-24">Đơn giá</th>
                  <th className="text-center py-2 px-2 w-24">SL</th>
                  <th className="text-right py-2 px-2 w-24">Thành tiền</th>
                  {mode === 'edit' && <th className="py-2 px-2 w-8" />}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-400 flex gap-1">
                        {item.maview && <code className="font-mono">{item.maview}</code>}
                        <span>{item.brand}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">{fmt(item.price)}</td>
                    <td className="py-2 px-2">
                      {mode === 'edit' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => changeQty(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors">
                            <Minus size={11} />
                          </button>
                          <span className="w-8 text-center font-bold">{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center border rounded hover:hover:bg-green-50 hover:border-green-300 hover:text-primary transition-colors">
                            <Plus size={11} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center font-bold">{item.qty}</div>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-primary">{fmt(item.price * item.qty)}</td>
                    {mode === 'edit' && (
                      <td className="py-2 px-2">
                        <button onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={mode === 'edit' ? 4 : 3} className="text-right py-3 px-2 text-sm font-bold text-gray-600">
                    TỔNG CỘNG:
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-lg font-black text-primary">{fmt(total)}</span>
                  </td>
                  {mode === 'edit' && <td />}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Ghi chú */}
          {(order.note || mode === 'edit') && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Ghi chú</h3>
              {mode === 'edit' ? (
                <textarea value={order.note} rows={2} onChange={e => setOrder(o => ({ ...o, note: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{order.note || '—'}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Trang chính ─────────────────────────────────────────────────
export default function POSOrders() {
  const { user } = useAuth();

  // Bộ lọc
  const todayStr = toInputDate(new Date());
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [selectedStaff, setSelectedStaff] = useState([]); // [] = tất cả
  const [orders, setOrders] = useState(posOrders);

  // Modal
  const [modal, setModal] = useState(null); // { order, mode: 'view'|'edit' }

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Áp dụng bộ lọc
  const filtered = useMemo(() => {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const staffFilter = selectedStaff.length === 0 || selectedStaff.length === STAFF_LIST.length
      ? null
      : selectedStaff;

    return orders.filter(o => {
      const created = new Date(o.createdAt);
      if (created < from || created > to) return false;
      if (staffFilter && !staffFilter.includes(o.staffUsername)) return false;
      return true;
    });
  }, [orders, fromDate, toDate, selectedStaff]);

  // Reset về trang 1 khi bộ lọc thay đổi
  useEffect(() => { setPage(1); }, [fromDate, toDate, selectedStaff, orders]);

  // Dữ liệu trang hiện tại
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedOrders = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  // Thống kê nhanh
  const stats = useMemo(() => ({
    total: filtered.length,
    revenue: filtered.filter(o => o.status !== ORDER_STATUS.CANCELLED).reduce((s, o) => s + o.total, 0),
    pending: filtered.filter(o => o.status === ORDER_STATUS.PENDING).length,
    invoiced: filtered.filter(o => o.status === ORDER_STATUS.INVOICED).length,
    cancelled: filtered.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
  }), [filtered]);

  // Lưu thay đổi đơn
  const handleSave = useCallback((updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    if (modal?.order.id === updated.id) setModal(m => ({ ...m, order: updated }));
  }, [modal]);

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>›</span>
        <Link to="/pos" className="hover:text-primary flex items-center gap-1">
          <MonitorCheck size={11} /> Bán hàng (POS)
        </Link>
        <span>›</span>
        <span className="text-primary font-medium">Lịch sử đơn bán</span>
      </div>

      {/* Tiêu đề trang */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Lịch sử đơn bán tại quầy</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {user.role === 'admin' ? 'Tất cả nhân viên' : `Nhân viên: ${user.name}`}
          </p>
        </div>
        <span className="text-xs text-gray-400">Cập nhật: {fmtDate(new Date().toISOString())}</span>
      </div>

      <div className="space-y-4">
        {/* Bộ lọc */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Từ ngày */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            {/* Đến ngày */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            {/* Nhân viên — chỉ admin thấy */}
            {user.role === 'admin' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nhân viên</label>
                <StaffMultiSelect selected={selectedStaff} onChange={setSelectedStaff} />
              </div>
            )}
            {/* Nút tải lại */}
            <button
              onClick={() => setOrders([...posOrders])}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              <RefreshCw size={14} />
              Tải lại
            </button>

            {/* Thống kê nhanh bên phải */}
            <div className="ml-auto flex items-center gap-3 text-xs">
              <div className="text-center px-3 py-1 bg-gray-50 rounded-lg border">
                <div className="font-bold text-gray-800 text-sm">{stats.total}</div>
                <div className="text-gray-500">Tổng đơn</div>
              </div>
              <div className="text-center px-3 py-1 bg-amber-50 rounded-lg border border-amber-200">
                <div className="font-bold text-amber-700 text-sm">{stats.pending}</div>
                <div className="text-amber-600">Chưa HĐ</div>
              </div>
              <div className="text-center px-3 py-1 bg-green-50 rounded-lg border border-green-200">
                <div className="font-bold text-green-700 text-sm">{stats.invoiced}</div>
                <div className="text-green-600">Đã HĐ</div>
              </div>
              <div className="text-center px-3 py-1 bg-primary-light rounded-lg border border-primary/20">
                <div className="font-bold text-primary text-sm">{fmt(stats.revenue)}</div>
                <div className="text-gray-500">Doanh thu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng danh sách đơn */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-sm font-medium">Không có đơn nào trong khoảng thời gian này</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                    <th className="py-3 px-3 text-center w-10 font-semibold">STT</th>
                    <th className="py-3 px-3 text-left font-semibold">Số phiếu bán</th>
                    <th className="py-3 px-3 text-left font-semibold">Tên khách hàng</th>
                    <th className="py-3 px-3 text-center font-semibold w-24">Ngày sinh</th>
                    <th className="py-3 px-3 text-center font-semibold w-16">Giới tính</th>
                    <th className="py-3 px-3 text-left font-semibold w-28">SĐT</th>
                    <th className="py-3 px-3 text-left font-semibold">Địa chỉ</th>
                    <th className="py-3 px-3 text-left font-semibold w-28">Nhân viên</th>
                    <th className="py-3 px-3 text-right font-semibold w-28">Tổng tiền</th>
                    <th className="py-3 px-3 text-center font-semibold w-24">Trạng thái</th>
                    <th className="py-3 px-3 text-center font-semibold w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((order, idx) => {
                    const statusInfo = STATUS_MAP[order.status];
                    const editable = canEditOrder(order, user);
                    const stt = (page - 1) * pageSize + idx + 1;

                    return (
                      <tr key={order.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-gray-500">{stt}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-gray-800 text-xs">{order.id}</div>
                          <div className="text-xs text-gray-400">{fmtDate(order.createdAt)}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-gray-800">{order.customer.name}</div>
                          {order.doctor && <div className="text-xs text-gray-400">BS: {order.doctor}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-center text-xs text-gray-600">
                          {fmtDateOnly(order.customer.dob)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-xs text-gray-600">
                          {order.customer.gender || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-gray-700">
                          {order.customer.phone || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-gray-600 max-w-[150px]">
                          <div className="truncate" title={order.customer.address}>
                            {order.customer.address || '—'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-xs text-gray-700 font-medium">
                            {order.staffName}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-primary text-xs">
                          {fmt(order.total)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Xem đơn */}
                            <button
                              onClick={() => setModal({ order, mode: 'view' })}
                              title="Xem chi tiết"
                              className="w-7 h-7 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Eye size={15} />
                            </button>
                            {/* Sửa đơn — chỉ khi có quyền */}
                            {editable ? (
                              <button
                                onClick={() => setModal({ order, mode: 'edit' })}
                                title="Sửa đơn"
                                className="w-7 h-7 flex items-center justify-center text-amber-500 hover:bg-amber-50 rounded transition-colors"
                              >
                                <Edit2 size={15} />
                              </button>
                            ) : (
                              <span
                                title={
                                  order.status === ORDER_STATUS.INVOICED ? 'Đã xuất hóa đơn — không thể sửa' :
                                  order.status === ORDER_STATUS.CANCELLED ? 'Đơn đã hủy — không thể sửa' :
                                  'Bạn không có quyền sửa đơn này'
                                }
                                className="w-7 h-7 flex items-center justify-center text-gray-300 cursor-not-allowed"
                              >
                                <Edit2 size={15} />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer bảng — phân trang */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Thông tin tổng + chọn số dòng */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    Hiển thị <strong>{(page - 1) * pageSize + 1}</strong>–
                    <strong>{Math.min(page * pageSize, filtered.length)}</strong> / <strong>{filtered.length}</strong> đơn
                  </span>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1.5">
                    <span>Số dòng:</span>
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                      className="border border-gray-300 rounded px-2 py-0.5 text-xs outline-none focus:border-primary bg-white"
                    >
                      {[5, 10, 20, 50].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nút phân trang */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {/* Trang đầu */}
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Trang đầu"
                    >
                      «
                    </button>
                    {/* Trang trước */}
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-2.5 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹
                    </button>

                    {/* Các số trang — hiện tối đa 5 trang, có dấu ... */}
                    {(() => {
                      const pages = [];
                      const delta = 2;
                      const left = Math.max(2, page - delta);
                      const right = Math.min(totalPages - 1, page + delta);

                      pages.push(1);
                      if (left > 2) pages.push('...');
                      for (let i = left; i <= right; i++) pages.push(i);
                      if (right < totalPages - 1) pages.push('...');
                      if (totalPages > 1) pages.push(totalPages);

                      return pages.map((p, i) =>
                        p === '...' ? (
                          <span key={`dots-${i}`} className="px-1 text-xs text-gray-400">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-2.5 py-1 text-xs border rounded transition-colors ${
                              p === page
                                ? 'bg-primary text-white border-primary font-bold'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      );
                    })()}

                    {/* Trang tiếp */}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-2.5 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ›
                    </button>
                    {/* Trang cuối */}
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Trang cuối"
                    >
                      »
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ghi chú phân quyền */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
          <strong>Quy tắc sửa đơn:</strong>{' '}
          {user.role === 'admin'
            ? 'Admin có thể sửa tất cả đơn chưa xuất hóa đơn.'
            : 'Nhân viên chỉ sửa được đơn do chính mình tạo và chưa xuất hóa đơn.'}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <OrderModal
          order={modal.order}
          mode={modal.mode}
          user={user}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
