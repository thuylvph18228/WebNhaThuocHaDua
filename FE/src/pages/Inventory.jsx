import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Package, AlertTriangle, Clock, CheckCircle, PlusCircle,
  Search, TrendingDown, X, Trash2, Plus, FileText, Save,
  Edit2, ToggleLeft, ToggleRight, Eye, Printer,
  ChevronDown, ChevronLeft, Check, Ban,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useCatalog } from '../context/CatalogContext';
import {
  batches as initialBatches, getBatchStatus, getStockSummary,
  BATCH_STATUS,
  peekNextReceiptNo, consumeReceiptNo,
  peekNextExportNo, consumeExportNo,
  peekNextTransferNo, consumeTransferNo,
} from '../data/mockInventory';
import { ConfirmDialog, AlertDialog } from '../components/ConfirmDialog';

// ─── Helpers ────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}
function fmtDate(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}
function fmtDatetime(s) {
  if (!s) return '—';
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function daysLeft(dateStr) {
  return Math.floor((new Date(dateStr) - new Date()) / 86400000);
}
const TODAY_DATETIME = new Date().toISOString().slice(0, 16);
const TODAY_DATE = new Date().toISOString().split('T')[0];

const STATUS_CFG = {
  ok: { label: 'Bình thường', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={13} /> },
  low: { label: 'Sắp hết', cls: 'bg-amber-100 text-amber-700', icon: <TrendingDown size={13} /> },
  expiring: { label: 'Sắp HH', cls: 'bg-orange-100 text-orange-700', icon: <Clock size={13} /> },
  expired: { label: 'Đã HH', cls: 'bg-red-100 text-red-700', icon: <AlertTriangle size={13} /> },
};
const BATCH_CFG = {
  [BATCH_STATUS.ACTIVE]: { label: 'Đang bán', cls: 'bg-green-100 text-green-700' },
  [BATCH_STATUS.LOW]: { label: 'Sắp hết', cls: 'bg-amber-100 text-amber-700' },
  [BATCH_STATUS.EXPIRING]: { label: 'Sắp HH', cls: 'bg-orange-100 text-orange-700' },
  [BATCH_STATUS.EXPIRED]: { label: 'Hết hạn', cls: 'bg-red-100 text-red-700' },
};
const RECEIPT_STATUS = {
  draft: { label: 'Chưa duyệt', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
};
const EXPORT_STATUS = {
  draft: { label: 'Chưa duyệt', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Đã duyệt', cls: 'bg-red-100 text-red-700' },
};
const TRANSFER_STATUS = {
  draft: { label: 'Chưa duyệt', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
};

// ─── SearchableSelect ────────────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder = 'Chọn...', disabled }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => o.code === value);

  const filtered = useMemo(() => {
    if (!q.trim()) return options.filter(o => o.active !== false);
    const lower = q.toLowerCase();
    return options.filter(o => o.active !== false &&
      (o.name.toLowerCase().includes(lower) || String(o.code).includes(lower))
    );
  }, [options, q]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" disabled={disabled}
        onClick={() => { setOpen(o => !o); setQ(''); }}
        className={`w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm text-left outline-none bg-white transition-colors ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:border-primary focus:border-primary'
          } ${open ? 'border-primary' : ''}`}>
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
          {selected ? `[${selected.code}] ${selected.name}` : placeholder}
        </span>
        <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border rounded-lg z-50 mt-1">
          <div className="p-2 border-b">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full border border-gray-200 rounded pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary" />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400">Không tìm thấy</div>
            ) : filtered.map(o => (
              <button key={o.code} type="button"
                onMouseDown={() => { onChange(o.code); setOpen(false); setQ(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-primary-light hover:text-primary transition-colors border-b border-gray-50 last:border-0 ${value === o.code ? 'bg-primary-light text-primary font-medium' : ''}`}>
                <code className="text-xs bg-gray-100 px-1.5 rounded font-mono">{o.code}</code>
                <span className="flex-1">{o.name}</span>
                {value === o.code && <Check size={13} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ProductSearchInput ──────────────────────────────────────────
function ProductSearchInput({ value, onSelect, placeholder = 'Tìm tên hoặc quét mã view...' }) {
  const { products } = useProducts(); // dùng tất cả sản phẩm (kể cả ẩn) cho nhập/xuất kho
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (!value) setQ(''); }, [value]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    const exact = products.find(p => p.maview?.toUpperCase() === q.trim().toUpperCase());
    if (exact) return [exact];
    return products.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.maview?.toLowerCase().includes(lower) ||
      p.brand?.toLowerCase().includes(lower)
    ).slice(0, 8);
  }, [q, products]);

  useEffect(() => {
    const exact = products.find(p => p.maview?.toUpperCase() === q.trim().toUpperCase());
    if (exact && q.trim()) { onSelect(exact); setQ(exact.name); setOpen(false); }
  }, [q, onSelect, products]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <input type="text" value={q} onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => q && setOpen(true)} placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-primary pr-7" />
      {q && <button type="button" onClick={() => { setQ(''); onSelect(null); setOpen(false); }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={12} /></button>}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border rounded-lg z-50 mt-0.5 max-h-52 overflow-y-auto">
          {results.map(p => (
            <button key={p.id} type="button"
              onMouseDown={() => { onSelect(p); setQ(p.name); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-light text-left border-b last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-800 line-clamp-1">{p.name}</div>
                <div className="text-[10px] text-gray-400 flex gap-1.5">
                  {p.maview && <code className="bg-gray-100 px-1 rounded font-mono">{p.maview}</code>}
                  <span>{p.brand}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-primary flex-shrink-0">{fmt(p.price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── StockTab ────────────────────────────────────────────────────
function StockTab({ filter, setFilter }) {
  const { products } = useProducts();
  const [search, setSearch] = useState('');
  const summary = useMemo(() => getStockSummary(products), [products]);
  const counts = useMemo(() => ({
    all: summary.length, warning: summary.filter(s => s.status !== 'ok').length,
    low: summary.filter(s => s.status === 'low').length,
    expiring: summary.filter(s => s.status === 'expiring').length,
    expired: summary.filter(s => s.status === 'expired').length,
  }), [summary]);
  const filtered = useMemo(() => summary.filter(s => {
    if (filter === 'low' && s.status !== 'low') return false;
    if (filter === 'expiring' && s.status !== 'expiring') return false;
    if (filter === 'expired' && s.status !== 'expired') return false;
    if (filter === 'warning' && s.status === 'ok') return false;
    if (search) {
      const q = search.toLowerCase();
      return s.product.name.toLowerCase().includes(q) || s.product.maview?.toLowerCase().includes(q);
    }
    return true;
  }), [summary, filter, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm thuốc, mã view..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        {[
          { key: 'all', label: `Tất cả (${counts.all})` },
          { key: 'warning', label: `⚠️ Cần chú ý (${counts.warning})` },
          { key: 'low', label: `📉 Sắp hết (${counts.low})` },
          { key: 'expiring', label: `⏰ Sắp HH (${counts.expiring})` },
          { key: 'expired', label: `🚫 Hết hạn (${counts.expired})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors ${filter === f.key ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-center py-3 px-3 font-semibold w-20">Mã view</th>
              <th className="text-left py-3 px-3 font-semibold">Thuốc</th>
              <th className="text-right py-3 px-3 font-semibold w-24">Tồn kho</th>
              <th className="text-center py-3 px-3 font-semibold w-20">Số lô</th>
              <th className="text-center py-3 px-3 font-semibold w-28">Hạn gần nhất</th>
              <th className="text-center py-3 px-3 font-semibold w-28">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400"><Package size={40} className="mx-auto mb-2 opacity-30" />Không có sản phẩm nào</td></tr>
            ) : filtered.map(({ product, totalRemaining, batchCount, nearestExpiry, lowStockThreshold, status }) => {
              const cfg = STATUS_CFG[status];
              const days = nearestExpiry ? daysLeft(nearestExpiry) : null;
              return (
                <tr key={product.id} className={`border-b border-gray-100 hover:bg-gray-50 ${status === 'expired' ? 'bg-red-50/30' : status === 'expiring' ? 'bg-orange-50/30' : ''}`}>
                  <td className="py-2.5 px-3 text-center"><code className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">{product.maview || '—'}</code></td>
                  <td className="py-2.5 px-3"><div className="font-medium text-gray-800">{product.name}</div><div className="text-xs text-gray-400">{product.brand}</div></td>
                  <td className="py-2.5 px-3 text-right"><span className={`font-bold text-base ${totalRemaining <= lowStockThreshold ? 'text-red-600' : 'text-gray-800'}`}>{totalRemaining}</span><span className="text-xs text-gray-400 ml-1">/ {lowStockThreshold}</span></td>
                  <td className="py-2.5 px-3 text-center text-xs text-gray-600">{batchCount} lô</td>
                  <td className="py-2.5 px-3 text-center text-xs">{nearestExpiry ? (<div><div className={days !== null && days <= 30 ? 'text-red-600 font-bold' : 'text-gray-700'}>{fmtDate(nearestExpiry)}</div><div className={`text-[11px] ${days < 0 ? 'text-red-500' : days <= 30 ? 'text-orange-500' : 'text-gray-400'}`}>{days < 0 ? `Đã HH ${Math.abs(days)}n` : `Còn ${days}n`}</div></div>) : '—'}</td>
                  <td className="py-2.5 px-3 text-center"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.icon} {cfg.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── BatchTab ────────────────────────────────────────────────────
function BatchTab({ batchList }) {
  const { products } = useProducts();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const enriched = useMemo(() => batchList.map(b => ({ ...b, product: products.find(p => p.id === b.productId), status: getBatchStatus(b) })), [batchList, products]);
  const filtered = useMemo(() => enriched.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (search) { const q = search.toLowerCase(); return b.batchNo.toLowerCase().includes(q) || b.product?.name.toLowerCase().includes(q) || b.product?.maview?.toLowerCase().includes(q); }
    return true;
  }).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)), [enriched, filterStatus, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Số lô, tên thuốc, mã view..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        {['all', BATCH_STATUS.ACTIVE, BATCH_STATUS.LOW, BATCH_STATUS.EXPIRING, BATCH_STATUS.EXPIRED].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors ${filterStatus === s ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {s === 'all' ? `Tất cả (${enriched.length})` : `${BATCH_CFG[s]?.label} (${enriched.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-left py-3 px-3 font-semibold">Số lô</th>
              <th className="text-left py-3 px-3 font-semibold">Tên thuốc</th>
              <th className="text-center py-3 px-3 font-semibold w-24">Ngày nhập</th>
              <th className="text-center py-3 px-3 font-semibold w-24">Hạn dùng</th>
              <th className="text-center py-3 px-3 font-semibold w-20">Còn lại</th>
              <th className="text-right py-3 px-3 font-semibold w-24">Giá nhập</th>
              <th className="text-center py-3 px-3 font-semibold w-24">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400"><Package size={40} className="mx-auto mb-2 opacity-30" />Không có lô hàng</td></tr>
              : filtered.map(b => {
                const days = daysLeft(b.expiryDate); const cfg = BATCH_CFG[b.status];
                return (
                  <tr key={b.id} className={`border-b border-gray-100 hover:bg-gray-50 ${b.status === BATCH_STATUS.EXPIRED ? 'opacity-60' : ''}`}>
                    <td className="py-2.5 px-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{b.batchNo}</code></td>
                    <td className="py-2.5 px-3"><div className="font-medium text-gray-800 line-clamp-1">{b.product?.name}</div>{b.product?.maview && <code className="text-xs text-gray-400 font-mono">{b.product.maview}</code>}</td>
                    <td className="py-2.5 px-3 text-center text-xs">{fmtDate(b.importDate)}</td>
                    <td className="py-2.5 px-3 text-center text-xs"><div className={days < 0 ? 'text-red-600 font-bold' : days <= 30 ? 'text-orange-600' : 'text-gray-700'}>{fmtDate(b.expiryDate)}</div><div className={`text-[11px] ${days < 0 ? 'text-red-400' : days <= 30 ? 'text-orange-400' : 'text-gray-400'}`}>{days < 0 ? `Đã HH ${Math.abs(days)}n` : `Còn ${days}n`}</div></td>
                    <td className="py-2.5 px-3 text-center"><span className={`font-bold ${b.remaining <= b.lowStockThreshold ? 'text-red-600' : 'text-gray-800'}`}>{b.remaining}</span><span className="text-xs text-gray-400">/{b.quantity}</span></td>
                    <td className="py-2.5 px-3 text-right text-xs">{fmt(b.importPrice)}</td>
                    <td className="py-2.5 px-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.cls}`}>{cfg?.label}</span></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tạo dòng chi tiết rỗng ─────────────────────────────────────
function newLine(receiptNo, idx) {
  return { lineId: `${receiptNo}-${String(idx + 1).padStart(2, '0')}`, productId: null, productName: '', batchNo: '', expiryDate: '', quantity: '1', importPrice: '' };
}

// ─── ReceiptForm (tạo mới / sửa) ────────────────────────────────
function ReceiptForm({ receipt, receiptNo, reasons, suppliers, warehouses, user, onSave, onCancel }) {
  const isEdit = !!receipt;
  const [header, setHeader] = useState(receipt ? { ...receipt } : {
    reasonCode: '', importDatetime: TODAY_DATETIME, supplierCode: '',
    deliveryPerson: '', receiver: user?.name || '',
    warehouseCode: '', invoiceCode: '', invoiceNo: '', invoiceDate: '', note: '',
  });
  const [lines, setLines] = useState(() =>
    receipt ? [...receipt.lines, newLine(receipt.id, receipt.lines.length)]
      : [newLine(receiptNo, 0)]
  );
  const [error, setError] = useState('');

  const setH = useCallback((k, v) => setHeader(h => ({ ...h, [k]: v })), []);
  const selectedReason = reasons.find(r => r.code === header.reasonCode);
  const requiresInvoice = selectedReason?.requiresInvoice;

  const updateLine = (idx, field, value) =>
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));

  const handleProductSelect = (idx, product) => {
    setLines(prev => {
      const updated = prev.map((l, i) => i !== idx ? l : {
        ...l, productId: product?.id ?? null, productName: product?.name ?? '',
        importPrice: product ? String(Math.round(product.price * 0.7)) : '',
      });
      if (product && idx === prev.length - 1)
        return [...updated, newLine(isEdit ? receipt.id : receiptNo, prev.length)];
      return updated;
    });
  };

  const addLine = () => setLines(prev => [...prev, newLine(isEdit ? receipt.id : receiptNo, prev.length)]);
  const removeLine = idx => { if (lines.length > 1) setLines(prev => prev.filter((_, i) => i !== idx)); };

  const effectiveLines = lines.filter(l => l.productId);
  const grandTotal = effectiveLines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.importPrice) || 0), 0);
  const totalQty = effectiveLines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);

  const handleSave = e => {
    e.preventDefault();
    setError('');
    if (!header.reasonCode) { setError('Vui lòng chọn lý do nhập'); return; }
    if (!header.supplierCode) { setError('Vui lòng chọn nhà cung cấp'); return; }
    if (!header.warehouseCode) { setError('Vui lòng chọn kho nhập'); return; }
    if (requiresInvoice && !header.invoiceNo.trim()) { setError('Nhập hóa đơn: bắt buộc số hóa đơn'); return; }
    if (requiresInvoice && !header.invoiceDate) { setError('Nhập hóa đơn: bắt buộc ngày hóa đơn'); return; }
    if (effectiveLines.length === 0) { setError('Chưa có thuốc nào trong phiếu'); return; }
    for (let i = 0; i < effectiveLines.length; i++) {
      const l = effectiveLines[i];
      if (!l.quantity || Number(l.quantity) <= 0) { setError(`Dòng ${i + 1}: số lượng phải > 0`); return; }
      if (!l.importPrice || Number(l.importPrice) <= 0) { setError(`Dòng ${i + 1}: chưa nhập giá nhập`); return; }
    }
    onSave({ ...header, lines: effectiveLines, grandTotal, totalQty });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Cuống phiếu */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm"><FileText size={16} />
            {isEdit ? `CHỈNH SỬA PHIẾU NHẬP` : 'PHIẾU NHẬP HÀNG MỚI'}
          </div>
          <code className="font-mono text-sm bg-white/20 px-3 py-0.5 rounded">{isEdit ? receipt.id : receiptNo}</code>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lý do nhập <span className="text-red-500">*</span></label>
            <SearchableSelect options={reasons} value={header.reasonCode} onChange={v => setH('reasonCode', v)} placeholder="— Chọn lý do nhập —" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày nhập <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={header.importDatetime} onChange={e => setH('importDatetime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
            <SearchableSelect options={suppliers} value={header.supplierCode} onChange={v => setH('supplierCode', v)} placeholder="— Chọn nhà cung cấp —" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kho nhập <span className="text-red-500">*</span></label>
            <SearchableSelect options={warehouses} value={header.warehouseCode} onChange={v => setH('warehouseCode', v)} placeholder="— Chọn kho —" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Người giao hàng</label>
            <input type="text" value={header.deliveryPerson} onChange={e => setH('deliveryPerson', e.target.value)}
              placeholder="Tên người giao" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Người nhận hàng</label>
            <input type="text" value={header.receiver} onChange={e => setH('receiver', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mã hóa đơn</label>
            <input type="text" value={header.invoiceCode} onChange={e => setH('invoiceCode', e.target.value)}
              placeholder="VD: HD-2024-001" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Số hóa đơn {requiresInvoice && <span className="text-red-500">*</span>}
            </label>
            <input type="text" value={header.invoiceNo} onChange={e => setH('invoiceNo', e.target.value)}
              placeholder={requiresInvoice ? 'Bắt buộc' : 'Không bắt buộc'}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary ${requiresInvoice ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Ngày hóa đơn {requiresInvoice && <span className="text-red-500">*</span>}
            </label>
            <input type="date" value={header.invoiceDate} onChange={e => setH('invoiceDate', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary ${requiresInvoice ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}`} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chú</label>
            <textarea value={header.note} onChange={e => setH('note', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
          </div>
        </div>
      </div>

      {requiresInvoice && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-sm text-amber-700">
          <AlertTriangle size={15} className="flex-shrink-0" />
          Lý do <strong>Nhập hóa đơn</strong>: bắt buộc điền số hóa đơn và ngày hóa đơn.
        </div>
      )}

      {/* Bảng chi tiết */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-700 text-white text-sm font-bold flex items-center justify-between">
          <span>
            Chi tiết nhập ({effectiveLines.length} thuốc
            {lines.length > effectiveLines.length && <span className="text-gray-400 font-normal text-xs ml-1">+ {lines.length - effectiveLines.length} dòng trắng</span>})
          </span>
          <button type="button" onClick={addLine}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs px-3 py-1 rounded transition-colors">
            <Plus size={13} /> Thêm dòng
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                <th className="text-center py-2 px-2 w-8">#</th>
                <th className="text-center py-2 px-2 w-24 font-semibold">Mã chi tiết</th>
                <th className="text-center py-2 px-2 font-semibold">Thuốc *</th>
                <th className="text-center py-2 px-2 w-28 font-semibold">Số lô</th>
                <th className="text-center py-2 px-2 w-28 font-semibold">Hạn dùng</th>
                <th className="text-center py-2 px-1 w-24 font-semibold">SL *</th>
                <th className="text-center py-2 px-1 w-24 font-semibold">Giá nhập *</th>
                <th className="text-center py-2 px-2 w-24 font-semibold">Thành tiền</th>
                <th className="py-2 px-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => {
                const isBlank = !line.productId;
                const lineTotal = (Number(line.quantity) || 0) * (Number(line.importPrice) || 0);
                const days = line.expiryDate ? daysLeft(line.expiryDate) : null;
                return (
                  <tr key={line.lineId} className={`border-b ${isBlank ? 'bg-gray-50/60' : idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="py-1.5 px-2 text-center text-xs text-gray-400">{isBlank ? '—' : idx + 1}</td>
                    <td className="py-1.5 px-2"><code className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{line.lineId}</code></td>
                    <td className="py-1.5 px-2"><ProductSearchInput value={line.productName} onSelect={p => handleProductSelect(idx, p)} placeholder="Tên hoặc mã view..." /></td>
                    <td className="py-1.5 px-2">
                      <input type="text" value={line.batchNo} disabled={isBlank}
                        onChange={e => updateLine(idx, 'batchNo', e.target.value)}
                        placeholder={isBlank ? '—' : 'Số lô (không bắt buộc)'}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-primary font-mono disabled:bg-gray-50" />
                    </td>
                    <td className="py-1.5 px-2">
                      <input type="date" value={line.expiryDate} disabled={isBlank} min={TODAY_DATE}
                        onChange={e => updateLine(idx, 'expiryDate', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-primary disabled:bg-gray-50" />
                      {days !== null && !isBlank && <div className={`text-[10px] text-center ${days <= 90 ? 'text-orange-500' : 'text-gray-400'}`}>Còn {days}n</div>}
                    </td>
                    <td className="py-1.5 px-1"><input type="number" min={1} value={line.quantity} disabled={isBlank} onChange={e => updateLine(idx, 'quantity', e.target.value)} className="w-full border border-gray-300 rounded px-1 py-1.5 text-xs text-right outline-none focus:border-primary disabled:bg-gray-50" /></td>
                    <td className="py-1.5 px-1"><input type="number" min={0} value={line.importPrice} disabled={isBlank} placeholder="0" onChange={e => updateLine(idx, 'importPrice', e.target.value)} className="w-full border border-gray-300 rounded px-1 py-1.5 text-xs text-right outline-none focus:border-primary disabled:bg-gray-50" /></td>
                    <td className="py-1.5 px-2 text-right text-xs font-bold text-primary">{!isBlank && lineTotal > 0 ? fmt(lineTotal) : '—'}</td>
                    <td className="py-1.5 px-2 text-center"><button type="button" onClick={() => removeLine(idx)} disabled={lines.length === 1} className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30 transition-colors"><Trash2 size={12} /></button></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={5} className="py-2.5 px-2 text-right text-xs font-bold text-gray-600">TỔNG ({effectiveLines.length} dòng):</td>
                <td className="py-2.5 px-2 text-right text-sm font-black text-gray-800">{totalQty}</td>
                <td />
                <td className="py-2.5 px-2 text-right text-sm font-black text-primary">{fmt(grandTotal)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"><X size={15} className="flex-shrink-0" />{error}</div>}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
          <ChevronLeft size={14} /> Quay lại
        </button>
        <button type="button" onClick={addLine} className="flex items-center gap-1.5 border border-primary text-primary px-4 py-2.5 rounded-lg hover:bg-primary-light text-sm font-medium">
          <Plus size={14} /> Thêm dòng
        </button>
        <button type="submit" className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
          <Save size={16} />
          {isEdit ? 'Lưu thay đổi' : `Lưu phiếu nhập${effectiveLines.length > 0 ? ` (${effectiveLines.length} dòng · ${fmt(grandTotal)})` : ''}`}
        </button>
      </div>
    </form>
  );
}

// ─── Print template ──────────────────────────────────────────────
function PrintReceipt({ receipt, reasons, suppliers, warehouses }) {
  const reason = reasons.find(r => r.code === receipt.reasonCode);
  const supplier = suppliers.find(s => s.code === receipt.supplierCode);
  const warehouse = warehouses.find(w => w.code === receipt.warehouseCode);
  const total = receipt.lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.importPrice) || 0), 0);

  return (
    <div id="print-area" className="hidden print:block p-8 font-sans text-sm">
      <div className="text-center mb-4">
        <div className="text-xl font-black">NHÀ THUỐC HÀ ĐUA</div>
        <div className="text-xs text-gray-500">196 Nguyễn Doãn Chất, TP.Thanh Hóa | 0972.201.843</div>
        <div className="text-lg font-bold mt-2">PHIẾU NHẬP KHO</div>
        <div className="text-base font-mono font-bold">{receipt.id}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-4 border rounded p-2">
        <div><b>Lý do:</b> {reason?.name}</div>
        <div><b>Ngày nhập:</b> {fmtDatetime(receipt.importDatetime)}</div>
        <div><b>Nhà cung cấp:</b> {supplier?.name}</div>
        <div><b>Kho nhập:</b> {warehouse?.name}</div>
        <div><b>Người giao:</b> {receipt.deliveryPerson || '—'}</div>
        <div><b>Người nhận:</b> {receipt.receiver}</div>
        {receipt.invoiceNo && <div><b>Số HĐ:</b> {receipt.invoiceNo}</div>}
        {receipt.invoiceDate && <div><b>Ngày HĐ:</b> {fmtDate(receipt.invoiceDate)}</div>}
      </div>
      <table className="w-full border-collapse text-xs mb-4">
        <thead>
          <tr className="border bg-gray-100">
            <th className="border p-1.5 w-8">STT</th>
            <th className="border p-1.5 text-left">Tên thuốc</th>
            <th className="border p-1.5 w-24">Số lô</th>
            <th className="border p-1.5 w-20">Hạn dùng</th>
            <th className="border p-1.5 w-12">SL</th>
            <th className="border p-1.5 w-24">Giá nhập</th>
            <th className="border p-1.5 w-28">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {receipt.lines.map((l, i) => (
            <tr key={l.lineId} className="border">
              <td className="border p-1.5 text-center">{i + 1}</td>
              <td className="border p-1.5">{l.productName}</td>
              <td className="border p-1.5 text-center font-mono">{l.batchNo || '—'}</td>
              <td className="border p-1.5 text-center">{l.expiryDate ? fmtDate(l.expiryDate) : '—'}</td>
              <td className="border p-1.5 text-right">{l.quantity}</td>
              <td className="border p-1.5 text-right">{fmt(Number(l.importPrice))}</td>
              <td className="border p-1.5 text-right font-bold">{fmt((Number(l.quantity) || 0) * (Number(l.importPrice) || 0))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border font-bold">
            <td colSpan={4} className="border p-1.5 text-right">TỔNG CỘNG:</td>
            <td className="border p-1.5 text-right">{receipt.totalQty}</td>
            <td />
            <td className="border p-1.5 text-right">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
      <div className="grid grid-cols-3 gap-4 text-xs text-center mt-8">
        <div><div className="font-bold">Người giao hàng</div><div className="text-gray-400 mt-8">Ký tên</div></div>
        <div><div className="font-bold">Người nhận hàng</div><div className="text-gray-400 mt-8">Ký tên</div></div>
        <div><div className="font-bold">Kế toán</div><div className="text-gray-400 mt-8">Ký tên</div></div>
      </div>
    </div>
  );
}

// Kiểm tra có thể hủy duyệt không:
// Điều kiện: tất cả dòng có số lô phải chưa bị xuất (remaining === quantity trong batches)
// Dòng không có số lô → bỏ qua (chưa cam kết vào kho)
function canRevokeReceipt(receipt, batches) {
  for (const line of receipt.lines) {
    if (!line.batchNo || !line.batchNo.trim()) continue; // Không có số lô → không ảnh hưởng
    const batch = batches.find(
      b => b.batchNo === line.batchNo && b.productId === line.productId
    );
    if (batch && batch.remaining < batch.quantity) {
      return false; // Đã có hàng xuất từ lô này
    }
  }
  return true;
}

// ─── ReceiptsTab ─────────────────────────────────────────────────
function ReceiptsTab({ receipts, setReceipts, reasons, suppliers, warehouses, batches, user, nextReceiptNo, onReceiptSaved, askConfirm, showError }) {
  const isAdmin = user?.role === 'admin';
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit' | 'detail'
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [printReceipt, setPrintReceipt] = useState(null);

  const filtered = useMemo(() => receipts.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.id.toLowerCase().includes(q) ||
        suppliers.find(s => s.code === r.supplierCode)?.name.toLowerCase().includes(q) ||
        r.receiver?.toLowerCase().includes(q) ||
        r.lines.some(l => l.productName?.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [receipts, filterStatus, search, suppliers]);

  const handleSaveReceipt = (formData) => {
    if (view === 'edit' && selected) {
      setReceipts(prev => prev.map(r => r.id === selected.id ? { ...r, ...formData, updatedAt: new Date().toISOString() } : r));
      setSelected(null);
    } else {
      const newReceipt = {
        id: nextReceiptNo,
        status: 'draft',
        createdBy: user?.name,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        approvedBy: null,
        approvedAt: null,
        ...formData,
      };
      setReceipts(prev => [...prev, newReceipt]);
      onReceiptSaved(); // Tăng counter số phiếu
    }
    setView('list');
  };

  const handleApprove = (receiptId) => {
    setReceipts(prev => prev.map(r => r.id === receiptId ? {
      ...r, status: 'approved', approvedBy: user?.name, approvedAt: new Date().toISOString(),
    } : r));
    setView('list');
  };

  const handleRevoke = (receiptId) => {
    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) return;
    if (!canRevokeReceipt(receipt, batches)) {
      showError('Không thể hủy duyệt: đã có hàng được xuất từ phiếu này.');
      return;
    }
    askConfirm(`Hủy duyệt phiếu ${receiptId}?\nPhiếu sẽ chuyển về trạng thái Chưa duyệt.`, () => {
      setReceipts(prev => prev.map(r => r.id === receiptId ? {
        ...r, status: 'draft', approvedBy: null, approvedAt: null,
      } : r));
      setView('list');
    });
  };

  const handleDelete = (receiptId) => {
    askConfirm('Bạn có chắc muốn xóa phiếu nhập này?', () => {
      setReceipts(prev => prev.filter(r => r.id !== receiptId));
      if (view !== 'list') setView('list');
    });
  };

  const handlePrint = (receipt) => {
    setPrintReceipt(receipt);
    setTimeout(() => { window.print(); setPrintReceipt(null); }, 300);
  };

  // ── Create / Edit form ──
  if (view === 'create' || view === 'edit') {
    return (
      <ReceiptForm
        receipt={view === 'edit' ? selected : null}
        receiptNo={nextReceiptNo}
        reasons={reasons} suppliers={suppliers} warehouses={warehouses} user={user}
        onSave={handleSaveReceipt}
        onCancel={() => { setView('list'); setSelected(null); }}
      />
    );
  }

  // ── Detail view ──
  if (view === 'detail' && selected) {
    const receipt = receipts.find(r => r.id === selected.id) || selected;
    const reason = reasons.find(r => r.code === receipt.reasonCode);
    const supplier = suppliers.find(s => s.code === receipt.supplierCode);
    const warehouse = warehouses.find(w => w.code === receipt.warehouseCode);
    const isDraft = receipt.status === 'draft';

    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <button onClick={() => { setView('list'); setSelected(null); }}
            className="flex items-center gap-1.5 text-gray-600 hover:text-primary text-sm transition-colors">
            <ChevronLeft size={16} /> Danh sách phiếu
          </button>
          <div className="flex-1" />
          {isDraft && (
            <button onClick={() => { setSelected(receipt); setView('edit'); }}
              className="flex items-center gap-1.5 border border-amber-400 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 text-sm font-medium transition-colors">
              <Edit2 size={14} /> Sửa phiếu
            </button>
          )}
          {isDraft && isAdmin && (
            <button onClick={() => handleApprove(receipt.id)}
              className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
              <Check size={14} /> Duyệt phiếu
            </button>
          )}
          {!isDraft && isAdmin && (() => {
            const revokable = canRevokeReceipt(receipt, batches);
            return (
              <button
                onClick={() => revokable && handleRevoke(receipt.id)}
                disabled={!revokable}
                title={revokable ? 'Hủy duyệt phiếu này' : 'Không thể hủy: đã có hàng xuất từ phiếu này'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${revokable
                  ? 'border border-orange-400 text-orange-600 hover:bg-orange-50 cursor-pointer'
                  : 'border border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                  }`}>
                <Ban size={14} /> Hủy duyệt
              </button>
            );
          })()}
          {isDraft && (
            <button onClick={() => handleDelete(receipt.id)}
              className="flex items-center gap-1.5 border border-red-300 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm transition-colors">
              <Trash2 size={14} /> Xóa
            </button>
          )}
          <button onClick={() => handlePrint(receipt)}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm transition-colors">
            <Printer size={14} /> In phiếu
          </button>
        </div>

        {/* Header phiếu */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            <div className="font-bold text-sm">CHI TIẾT PHIẾU NHẬP</div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${RECEIPT_STATUS[receipt.status]?.cls}`}>
                {RECEIPT_STATUS[receipt.status]?.label}
              </span>
              <code className="font-mono text-sm bg-white/20 px-3 py-0.5 rounded">{receipt.id}</code>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              ['Lý do nhập', reason?.name || '—'],
              ['Ngày nhập', fmtDatetime(receipt.importDatetime)],
              ['Nhà cung cấp', supplier?.name || '—'],
              ['Kho nhập', warehouse?.name || '—'],
              ['Người giao', receipt.deliveryPerson || '—'],
              ['Người nhận', receipt.receiver || '—'],
              receipt.invoiceNo && ['Số hóa đơn', receipt.invoiceNo],
              receipt.invoiceDate && ['Ngày hóa đơn', fmtDate(receipt.invoiceDate)],
              ['Người tạo', receipt.createdBy],
              ['Ngày tạo', fmtDatetime(receipt.createdAt)],
              receipt.approvedBy && ['Người duyệt', receipt.approvedBy],
              receipt.approvedAt && ['Ngày duyệt', fmtDatetime(receipt.approvedAt)],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-400">{k}</div>
                <div className="text-gray-800 font-medium mt-0.5 text-xs">{v}</div>
              </div>
            ))}
          </div>
          {receipt.note && <div className="px-4 pb-4 text-sm text-gray-500 italic">Ghi chú: {receipt.note}</div>}
        </div>

        {/* Chi tiết dòng */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-2.5 text-sm font-bold">Chi tiết nhập ({receipt.lines.length} dòng)</div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-center py-2 px-3 w-8">STT</th>
              <th className="text-left py-2 px-3 font-semibold">Tên thuốc</th>
              <th className="text-left py-2 px-3 w-28 font-semibold">Số lô</th>
              <th className="text-center py-2 px-3 w-24 font-semibold">Hạn dùng</th>
              <th className="text-right py-2 px-3 w-18 font-semibold">SL</th>
              <th className="text-right py-2 px-3 w-28 font-semibold">Giá nhập</th>
              <th className="text-right py-2 px-3 w-28 font-semibold">Thành tiền</th>
            </tr></thead>
            <tbody>
              {receipt.lines.map((l, i) => (
                <tr key={l.lineId} className={`border-b ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="py-2 px-3 text-center text-xs text-gray-500">{i + 1}</td>
                  <td className="py-2 px-3"><div className="font-medium text-gray-800">{l.productName}</div></td>
                  <td className="py-2 px-3"><code className="font-mono text-xs text-gray-600">{l.batchNo || '—'}</code></td>
                  <td className="py-2 px-3 text-center text-xs">{l.expiryDate ? fmtDate(l.expiryDate) : '—'}</td>
                  <td className="py-2 px-3 text-right font-bold">{l.quantity}</td>
                  <td className="py-2 px-3 text-right text-xs">{fmt(Number(l.importPrice))}</td>
                  <td className="py-2 px-3 text-right font-bold text-primary">{fmt((Number(l.quantity) || 0) * (Number(l.importPrice) || 0))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={4} className="py-2.5 px-3 text-right text-xs font-bold text-gray-600">TỔNG CỘNG:</td>
              <td className="py-2.5 px-3 text-right font-black">{receipt.totalQty}</td>
              <td />
              <td className="py-2.5 px-3 text-right font-black text-primary">{fmt(receipt.grandTotal)}</td>
            </tr></tfoot>
          </table>
        </div>
        {printReceipt && <PrintReceipt receipt={printReceipt} reasons={reasons} suppliers={suppliers} warehouses={warehouses} />}
      </div>
    );
  }

  // ── Danh sách phiếu (default) ──
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Số phiếu, nhà cung cấp, thuốc..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        {[
          { key: 'all', label: `Tất cả (${receipts.length})` },
          { key: 'draft', label: `Chưa duyệt (${receipts.filter(r => r.status === 'draft').length})` },
          { key: 'approved', label: `Đã duyệt (${receipts.filter(r => r.status === 'approved').length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors ${filterStatus === f.key ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setView('create')}
          className="ml-auto flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium transition-colors">
          <PlusCircle size={15} /> Tạo phiếu nhập
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm py-16 text-center text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <div className="font-medium">Chưa có phiếu nhập nào</div>
          <button onClick={() => setView('create')} className="mt-3 text-primary text-sm hover:underline">Tạo phiếu đầu tiên →</button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                <th className="text-left py-3 px-3 font-semibold w-28">Số phiếu</th>
                <th className="text-left py-3 px-3 font-semibold">Nhà cung cấp</th>
                <th className="text-left py-3 px-3 font-semibold w-24">Kho nhập</th>
                <th className="text-center py-3 px-3 font-semibold w-32">Ngày nhập</th>
                <th className="text-center py-3 px-3 font-semibold w-16">Số dòng</th>
                <th className="text-right py-3 px-3 font-semibold w-28">Tổng tiền</th>
                <th className="text-left py-3 px-3 font-semibold w-24">Người tạo</th>
                <th className="text-center py-3 px-3 font-semibold w-24">Trạng thái</th>
                <th className="text-center py-3 px-3 font-semibold w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const isDraft = r.status === 'draft';
                const supplier = suppliers.find(s => s.code === r.supplierCode);
                const warehouse = warehouses.find(w => w.code === r.warehouseCode);
                return (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{r.id}</code>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-700 max-w-[160px]">
                      <div className="truncate">{supplier?.name || '—'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">{warehouse?.name || '—'}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-gray-600">{fmtDatetime(r.importDatetime)}</td>
                    <td className="py-2.5 px-3 text-center text-xs font-medium">{r.lines.length}</td>
                    <td className="py-2.5 px-3 text-right text-xs font-bold text-primary">{fmt(r.grandTotal)}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">{r.createdBy}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RECEIPT_STATUS[r.status]?.cls}`}>{RECEIPT_STATUS[r.status]?.label}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelected(r); setView('detail'); }} title="Xem chi tiết"
                          className="w-7 h-7 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded transition-colors"><Eye size={14} /></button>
                        {isDraft && <button onClick={() => { setSelected(r); setView('edit'); }} title="Sửa phiếu"
                          className="w-7 h-7 flex items-center justify-center text-amber-500 hover:bg-amber-50 rounded transition-colors"><Edit2 size={14} /></button>}
                        {isDraft && isAdmin && <button onClick={() => handleApprove(r.id)} title="Duyệt phiếu"
                          className="w-7 h-7 flex items-center justify-center text-green-600 hover:bg-green-50 rounded transition-colors"><Check size={14} /></button>}
                        {!isDraft && isAdmin && (() => {
                          const revokable = canRevokeReceipt(r, batches);
                          return (
                            <button
                              onClick={() => revokable && handleRevoke(r.id)}
                              disabled={!revokable}
                              title={revokable ? 'Hủy duyệt' : 'Đã có hàng xuất — không thể hủy'}
                              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${revokable
                                ? 'text-orange-500 hover:bg-orange-50 cursor-pointer'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}>
                              <Ban size={14} />
                            </button>
                          );
                        })()}
                        {isDraft && <button onClick={() => handleDelete(r.id)} title="Xóa"
                          className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>}
                        <button onClick={() => handlePrint(r)} title="In phiếu"
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded transition-colors"><Printer size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 bg-gray-50 border-t text-xs text-gray-500">Hiển thị <strong>{filtered.length}</strong> phiếu</div>
        </div>
      )}
      {printReceipt && <PrintReceipt receipt={printReceipt} reasons={reasons} suppliers={suppliers} warehouses={warehouses} />}
    </div>
  );
}

// ─── ExportForm ──────────────────────────────────────────────────
function newExportLine(exportNo, idx) {
  return { lineId: `${exportNo}-${String(idx + 1).padStart(2, '0')}`, productId: null, productName: '', batchId: null, batchNo: '', expiryDate: '', maxQty: 0, quantity: '1' };
}

function ExportForm({ exportNo, exportReasons, warehouses, batches, user, onSave, onCancel, existingExport }) {
  const isEdit = !!existingExport;
  const [header, setHeader] = useState(existingExport ? { ...existingExport } : {
    exportReasonCode: '', warehouseCode: '', exportDatetime: TODAY_DATETIME, note: '',
  });
  const [lines, setLines] = useState(() =>
    existingExport
      ? [...existingExport.lines, newExportLine(existingExport.id, existingExport.lines.length)]
      : [newExportLine(exportNo, 0)]
  );
  const [error, setError] = useState('');
  const setH = useCallback((k, v) => setHeader(h => ({ ...h, [k]: v })), []);
  const getAvailBatches = (productId) => batches.filter(b => b.productId === productId && b.remaining > 0);

  const handleProductSelect = (idx, product) => {
    setLines(prev => {
      const updated = prev.map((l, i) => i !== idx ? l : {
        ...l, productId: product?.id ?? null, productName: product?.name ?? '',
        batchId: null, batchNo: '', expiryDate: '', maxQty: 0, quantity: '1',
      });
      if (product && idx === prev.length - 1)
        return [...updated, newExportLine(isEdit ? existingExport.id : exportNo, prev.length)];
      return updated;
    });
  };

  const handleBatchSelect = (idx, batchId) => {
    const b = batches.find(b => b.id === batchId);
    setLines(prev => prev.map((l, i) => i !== idx ? l : {
      ...l, batchId: b?.id ?? null, batchNo: b?.batchNo ?? '', expiryDate: b?.expiryDate ?? '', maxQty: b?.remaining ?? 0,
    }));
  };

  const updateLine = (idx, field, value) => setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  const removeLine = idx => { if (lines.length > 1) setLines(prev => prev.filter((_, i) => i !== idx)); };
  const effectiveLines = lines.filter(l => l.productId);
  const totalQty = effectiveLines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);

  const handleSave = e => {
    e.preventDefault(); setError('');
    if (!header.exportReasonCode) { setError('Vui lòng chọn lý do xuất'); return; }
    if (!header.warehouseCode) { setError('Vui lòng chọn kho xuất'); return; }
    if (effectiveLines.length === 0) { setError('Chưa có thuốc nào trong phiếu'); return; }
    for (let i = 0; i < effectiveLines.length; i++) {
      const l = effectiveLines[i];
      if (!l.quantity || Number(l.quantity) <= 0) { setError(`Dòng ${i + 1}: số lượng phải > 0`); return; }
      if (l.batchId && Number(l.quantity) > l.maxQty) { setError(`Dòng ${i + 1}: vượt tồn kho lô (còn ${l.maxQty})`); return; }
    }
    onSave({ ...header, lines: effectiveLines, totalQty });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm"><FileText size={16} />{isEdit ? 'CHỈNH SỬA PHIẾU XUẤT' : 'PHIẾU XUẤT HÀNG MỚI'}</div>
          <code className="font-mono text-sm bg-white/20 px-3 py-0.5 rounded">{isEdit ? existingExport.id : exportNo}</code>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lý do xuất <span className="text-red-500">*</span></label>
            <SearchableSelect options={exportReasons} value={header.exportReasonCode} onChange={v => setH('exportReasonCode', v)} placeholder="— Chọn lý do xuất —" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày xuất <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={header.exportDatetime} onChange={e => setH('exportDatetime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kho xuất <span className="text-red-500">*</span></label>
            <SearchableSelect options={warehouses} value={header.warehouseCode} onChange={v => setH('warehouseCode', v)} placeholder="— Chọn kho —" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chú</label>
            <textarea value={header.note} onChange={e => setH('note', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-700 text-white text-sm font-bold flex items-center justify-between">
          <span>Chi tiết xuất ({effectiveLines.length} dòng)</span>
          <button type="button" onClick={() => setLines(p => [...p, newExportLine(isEdit ? existingExport.id : exportNo, p.length)])}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs px-3 py-1 rounded">
            <Plus size={13} /> Thêm dòng
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-center py-2 px-2 w-8">#</th>
              <th className="text-center py-2 px-2 font-semibold">Thuốc *</th>
              <th className="text-center py-2 px-2 w-44 font-semibold">Lô hàng</th>
              <th className="text-center py-2 px-2 w-24 font-semibold">Hạn dùng</th>
              <th className="text-center py-2 px-2 w-16 font-semibold">Tồn lô</th>
              <th className="text-center py-2 px-1 w-20 font-semibold">SL xuất *</th>
              <th className="py-2 px-2 w-8" />
            </tr></thead>
            <tbody>
              {lines.map((line, idx) => {
                const isBlank = !line.productId;
                const availBatches = line.productId ? getAvailBatches(line.productId) : [];
                const days = line.expiryDate ? daysLeft(line.expiryDate) : null;
                return (
                  <tr key={line.lineId} className={`border-b ${isBlank ? 'bg-gray-50/60' : ''}`}>
                    <td className="py-1.5 px-2 text-center text-xs text-gray-400">{isBlank ? '—' : idx + 1}</td>
                    <td className="py-1.5 px-2"><ProductSearchInput value={line.productName} onSelect={p => handleProductSelect(idx, p)} placeholder="Tên hoặc mã view..." /></td>
                    <td className="py-1.5 px-2">
                      <select value={line.batchId || ''} disabled={isBlank}
                        onChange={e => handleBatchSelect(idx, e.target.value || null)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-primary disabled:bg-gray-50">
                        <option value="">{isBlank ? '—' : availBatches.length === 0 ? 'Hết tồn' : 'Chọn lô...'}</option>
                        {availBatches.map(b => (
                          <option key={b.id} value={b.id}>{b.batchNo} | HH: {fmtDate(b.expiryDate)} | Còn: {b.remaining}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-center text-xs">
                      {line.expiryDate
                        ? <><div className={days < 0 ? 'text-red-600 font-bold' : days <= 30 ? 'text-orange-600' : 'text-gray-700'}>{fmtDate(line.expiryDate)}</div>
                          <div className={`text-[10px] ${days < 0 ? 'text-red-400' : days <= 30 ? 'text-orange-400' : 'text-gray-400'}`}>{days < 0 ? 'Đã HH' : `Còn ${days}n`}</div></>
                        : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-center text-xs font-bold">
                      {line.batchId ? <span className={line.maxQty <= 5 ? 'text-red-600' : 'text-gray-700'}>{line.maxQty}</span> : '—'}
                    </td>
                    <td className="py-1.5 px-1">
                      <input type="number" min={1} max={line.maxQty || undefined} value={line.quantity} disabled={isBlank}
                        onChange={e => updateLine(idx, 'quantity', e.target.value)}
                        className="w-full border border-gray-300 rounded px-1 py-1.5 text-xs text-right outline-none focus:border-primary disabled:bg-gray-50" />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button type="button" onClick={() => removeLine(idx)} disabled={lines.length === 1}
                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 rounded disabled:opacity-30"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={5} className="py-2.5 px-2 text-right text-xs font-bold text-gray-600">TỔNG SỐ LƯỢNG:</td>
              <td className="py-2.5 px-2 text-right text-sm font-black text-gray-800">{totalQty}</td>
              <td />
            </tr></tfoot>
          </table>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"><X size={15} className="flex-shrink-0" />{error}</div>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
          <ChevronLeft size={14} /> Quay lại
        </button>
        <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
          <Save size={16} />
          {isEdit ? 'Lưu thay đổi' : `Lưu phiếu xuất${effectiveLines.length > 0 ? ` (${effectiveLines.length} dòng · ${totalQty} đvị)` : ''}`}
        </button>
      </div>
    </form>
  );
}

// ─── ExportTab ───────────────────────────────────────────────────
function ExportTab({ exports, setExports, exportReasons, warehouses, batches, setBatches, user, nextExportNo, onExportSaved, askConfirm }) {
  const isAdmin = user?.role === 'admin';
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => exports.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.id.toLowerCase().includes(q) || e.lines.some(l => l.productName?.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [exports, filterStatus, search]);

  const handleSaveExport = (formData) => {
    if (view === 'edit' && selected) {
      setExports(prev => prev.map(e => e.id === selected.id ? { ...e, ...formData, updatedAt: new Date().toISOString() } : e));
      setSelected(null);
    } else {
      setExports(prev => [...prev, { id: nextExportNo, status: 'draft', createdBy: user?.name, createdAt: new Date().toISOString(), updatedAt: null, approvedBy: null, approvedAt: null, ...formData }]);
      onExportSaved();
    }
    setView('list');
  };

  const handleApproveExport = (exportId) => {
    const exp = exports.find(e => e.id === exportId);
    if (!exp) return;
    // Giảm tồn lô theo từng dòng được chọn
    setBatches(prev => {
      let updated = [...prev];
      for (const line of exp.lines) {
        if (line.batchId) updated = updated.map(b => b.id === line.batchId ? { ...b, remaining: Math.max(0, b.remaining - (Number(line.quantity) || 0)) } : b);
      }
      return updated;
    });
    setExports(prev => prev.map(e => e.id === exportId ? { ...e, status: 'approved', approvedBy: user?.name, approvedAt: new Date().toISOString() } : e));
    setView('list');
  };

  const handleRevokeExport = (exportId) => {
    const exp = exports.find(e => e.id === exportId);
    if (!exp) return;
    askConfirm(`Hủy duyệt phiếu xuất ${exportId}?\nTồn kho các lô sẽ được hoàn trả.`, () => {
      // Tăng lại tồn lô khi hủy duyệt
      setBatches(prev => {
        let updated = [...prev];
        for (const line of exp.lines) {
          if (line.batchId) updated = updated.map(b => b.id === line.batchId ? { ...b, remaining: b.remaining + (Number(line.quantity) || 0) } : b);
        }
        return updated;
      });
      setExports(prev => prev.map(e => e.id === exportId ? { ...e, status: 'draft', approvedBy: null, approvedAt: null } : e));
      setView('list');
    });
  };

  const handleDeleteExport = (exportId) => {
    askConfirm('Xóa phiếu xuất này?', () => {
      setExports(prev => prev.filter(e => e.id !== exportId));
      if (view !== 'list') setView('list');
    });
  };

  if (view === 'create' || view === 'edit') {
    return <ExportForm existingExport={view === 'edit' ? selected : null} exportNo={nextExportNo}
      exportReasons={exportReasons} warehouses={warehouses} batches={batches} user={user}
      onSave={handleSaveExport} onCancel={() => { setView('list'); setSelected(null); }} />;
  }

  if (view === 'detail' && selected) {
    const exp = exports.find(e => e.id === selected.id) || selected;
    const reason = exportReasons.find(r => r.code === exp.exportReasonCode);
    const warehouse = warehouses.find(w => w.code === exp.warehouseCode);
    const isDraft = exp.status === 'draft';
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView('list'); setSelected(null); }}
            className="flex items-center gap-1.5 text-gray-600 hover:text-primary text-sm"><ChevronLeft size={16} /> Danh sách phiếu xuất</button>
          <div className="flex-1" />
          {isDraft && <button onClick={() => { setSelected(exp); setView('edit'); }}
            className="flex items-center gap-1.5 border border-amber-400 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 text-sm"><Edit2 size={14} /> Sửa</button>}
          {isDraft && isAdmin && <button onClick={() => handleApproveExport(exp.id)}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 text-sm font-medium"><Check size={14} /> Duyệt xuất</button>}
          {!isDraft && isAdmin && <button onClick={() => handleRevokeExport(exp.id)}
            className="flex items-center gap-1.5 border border-orange-400 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 text-sm"><Ban size={14} /> Hủy duyệt</button>}
          {isDraft && <button onClick={() => handleDeleteExport(exp.id)}
            className="flex items-center gap-1.5 border border-red-300 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm"><Trash2 size={14} /> Xóa</button>}
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="font-bold text-sm">CHI TIẾT PHIẾU XUẤT KHO</div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${EXPORT_STATUS[exp.status]?.cls}`}>{EXPORT_STATUS[exp.status]?.label}</span>
              <code className="font-mono text-sm bg-white/20 px-3 py-0.5 rounded">{exp.id}</code>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[['Lý do xuất', reason?.name || '—'], ['Ngày xuất', fmtDatetime(exp.exportDatetime)], ['Kho xuất', warehouse?.name || '—'], ['Người tạo', exp.createdBy],
            ['Ngày tạo', fmtDatetime(exp.createdAt)], exp.approvedBy && ['Người duyệt', exp.approvedBy], exp.approvedAt && ['Ngày duyệt', fmtDatetime(exp.approvedAt)]
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-400">{k}</div>
                <div className="text-gray-800 font-medium mt-0.5 text-xs">{v}</div>
              </div>
            ))}
          </div>
          {exp.note && <div className="px-4 pb-4 text-sm text-gray-500 italic">Ghi chú: {exp.note}</div>}
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-2.5 text-sm font-bold">Chi tiết xuất ({exp.lines.length} dòng)</div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-center py-2 px-3 w-8">STT</th>
              <th className="text-left py-2 px-3 font-semibold">Tên thuốc</th>
              <th className="text-left py-2 px-3 w-28 font-semibold">Số lô</th>
              <th className="text-center py-2 px-3 w-24 font-semibold">Hạn dùng</th>
              <th className="text-right py-2 px-3 w-20 font-semibold">SL xuất</th>
            </tr></thead>
            <tbody>
              {exp.lines.map((l, i) => (
                <tr key={l.lineId} className={`border-b ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="py-2 px-3 text-center text-xs text-gray-500">{i + 1}</td>
                  <td className="py-2 px-3 font-medium text-gray-800">{l.productName}</td>
                  <td className="py-2 px-3"><code className="font-mono text-xs text-gray-600">{l.batchNo || '—'}</code></td>
                  <td className="py-2 px-3 text-center text-xs">{l.expiryDate ? fmtDate(l.expiryDate) : '—'}</td>
                  <td className="py-2 px-3 text-right font-bold">{l.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={4} className="py-2.5 px-3 text-right text-xs font-bold text-gray-600">TỔNG SỐ LƯỢNG:</td>
              <td className="py-2.5 px-3 text-right font-black">{exp.totalQty}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Số phiếu, tên thuốc..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        {[
          { key: 'all', label: `Tất cả (${exports.length})` },
          { key: 'draft', label: `Chưa duyệt (${exports.filter(e => e.status === 'draft').length})` },
          { key: 'approved', label: `Đã duyệt (${exports.filter(e => e.status === 'approved').length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors ${filterStatus === f.key ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setView('create')}
          className="ml-auto flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium">
          <PlusCircle size={15} /> Tạo phiếu xuất
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm py-16 text-center text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <div className="font-medium">Chưa có phiếu xuất nào</div>
          <button onClick={() => setView('create')} className="mt-3 text-red-600 text-sm hover:underline">Tạo phiếu đầu tiên →</button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-left py-3 px-3 font-semibold w-28">Số phiếu</th>
              <th className="text-left py-3 px-3 font-semibold">Lý do xuất</th>
              <th className="text-left py-3 px-3 font-semibold w-24">Kho xuất</th>
              <th className="text-center py-3 px-3 font-semibold w-32">Ngày xuất</th>
              <th className="text-center py-3 px-3 font-semibold w-16">Số dòng</th>
              <th className="text-right py-3 px-3 font-semibold w-20">Tổng SL</th>
              <th className="text-left py-3 px-3 font-semibold w-24">Người tạo</th>
              <th className="text-center py-3 px-3 font-semibold w-24">Trạng thái</th>
              <th className="text-center py-3 px-3 font-semibold w-24">Thao tác</th>
            </tr></thead>
            <tbody>
              {filtered.map(e => {
                const isDraft = e.status === 'draft';
                const reason = exportReasons.find(r => r.code === e.exportReasonCode);
                const warehouse = warehouses.find(w => w.code === e.warehouseCode);
                return (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{e.id}</code></td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{reason?.name || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">{warehouse?.name || '—'}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-gray-600">{fmtDatetime(e.exportDatetime)}</td>
                    <td className="py-2.5 px-3 text-center text-xs font-medium">{e.lines.length}</td>
                    <td className="py-2.5 px-3 text-right text-xs font-bold">{e.totalQty}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">{e.createdBy}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${EXPORT_STATUS[e.status]?.cls}`}>{EXPORT_STATUS[e.status]?.label}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelected(e); setView('detail'); }} title="Xem chi tiết"
                          className="w-7 h-7 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded"><Eye size={14} /></button>
                        {isDraft && <button onClick={() => { setSelected(e); setView('edit'); }} title="Sửa"
                          className="w-7 h-7 flex items-center justify-center text-amber-500 hover:bg-amber-50 rounded"><Edit2 size={14} /></button>}
                        {isDraft && isAdmin && <button onClick={() => handleApproveExport(e.id)} title="Duyệt xuất"
                          className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-50 rounded"><Check size={14} /></button>}
                        {!isDraft && isAdmin && <button onClick={() => handleRevokeExport(e.id)} title="Hủy duyệt"
                          className="w-7 h-7 flex items-center justify-center text-orange-500 hover:bg-orange-50 rounded"><Ban size={14} /></button>}
                        {isDraft && <button onClick={() => handleDeleteExport(e.id)} title="Xóa"
                          className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 bg-gray-50 border-t text-xs text-gray-500">Hiển thị <strong>{filtered.length}</strong> phiếu</div>
        </div>
      )}
    </div>
  );
}

// ─── TransferForm ────────────────────────────────────────────────
function newTransferLine(transferNo, idx) {
  return { lineId: `${transferNo}-${String(idx + 1).padStart(2, '0')}`, productId: null, productName: '', batchId: null, batchNo: '', expiryDate: '', maxQty: 0, quantity: '1' };
}

function TransferForm({ transferNo, warehouses, batches, user, onSave, onCancel, existingTransfer }) {
  const isEdit = !!existingTransfer;
  const [header, setHeader] = useState(existingTransfer ? { ...existingTransfer } : {
    fromWarehouseCode: '', toWarehouseCode: '', transferDatetime: TODAY_DATETIME, note: '',
  });
  const [lines, setLines] = useState(() =>
    existingTransfer
      ? [...existingTransfer.lines, newTransferLine(existingTransfer.id, existingTransfer.lines.length)]
      : [newTransferLine(transferNo, 0)]
  );
  const [error, setError] = useState('');
  const setH = useCallback((k, v) => setHeader(h => ({ ...h, [k]: v })), []);
  const getAvailBatches = (productId) => batches.filter(b => b.productId === productId && b.remaining > 0);

  const handleProductSelect = (idx, product) => {
    setLines(prev => {
      const updated = prev.map((l, i) => i !== idx ? l : {
        ...l, productId: product?.id ?? null, productName: product?.name ?? '',
        batchId: null, batchNo: '', expiryDate: '', maxQty: 0, quantity: '1',
      });
      if (product && idx === prev.length - 1)
        return [...updated, newTransferLine(isEdit ? existingTransfer.id : transferNo, prev.length)];
      return updated;
    });
  };

  const handleBatchSelect = (idx, batchId) => {
    const b = batches.find(b => b.id === batchId);
    setLines(prev => prev.map((l, i) => i !== idx ? l : {
      ...l, batchId: b?.id ?? null, batchNo: b?.batchNo ?? '', expiryDate: b?.expiryDate ?? '', maxQty: b?.remaining ?? 0,
    }));
  };

  const updateLine = (idx, field, value) => setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  const removeLine = idx => { if (lines.length > 1) setLines(prev => prev.filter((_, i) => i !== idx)); };
  const effectiveLines = lines.filter(l => l.productId);
  const totalQty = effectiveLines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);

  const handleSave = e => {
    e.preventDefault(); setError('');
    if (!header.fromWarehouseCode) { setError('Vui lòng chọn kho xuất (nguồn)'); return; }
    if (!header.toWarehouseCode) { setError('Vui lòng chọn kho nhập (đích)'); return; }
    if (header.fromWarehouseCode === header.toWarehouseCode) { setError('Kho nguồn và kho đích phải khác nhau'); return; }
    if (effectiveLines.length === 0) { setError('Chưa có thuốc nào trong phiếu'); return; }
    for (let i = 0; i < effectiveLines.length; i++) {
      const l = effectiveLines[i];
      if (!l.quantity || Number(l.quantity) <= 0) { setError(`Dòng ${i + 1}: số lượng phải > 0`); return; }
      if (l.batchId && Number(l.quantity) > l.maxQty) { setError(`Dòng ${i + 1}: vượt tồn kho lô (còn ${l.maxQty})`); return; }
    }
    onSave({ ...header, lines: effectiveLines, totalQty });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm"><FileText size={16} />{isEdit ? 'CHỈNH SỬA PHIẾU LUÂN CHUYỂN' : 'PHIẾU LUÂN CHUYỂN KHO'}</div>
          <code className="font-mono text-sm bg-white/20 px-3 py-0.5 rounded">{isEdit ? existingTransfer.id : transferNo}</code>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kho xuất (nguồn) <span className="text-red-500">*</span></label>
            <SearchableSelect options={warehouses} value={header.fromWarehouseCode} onChange={v => setH('fromWarehouseCode', v)} placeholder="— Chọn kho nguồn —" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kho nhập (đích) <span className="text-red-500">*</span></label>
            <SearchableSelect options={warehouses.filter(w => w.code !== header.fromWarehouseCode)} value={header.toWarehouseCode} onChange={v => setH('toWarehouseCode', v)} placeholder="— Chọn kho đích —" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày chuyển <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={header.transferDatetime} onChange={e => setH('transferDatetime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chú</label>
            <textarea value={header.note} onChange={e => setH('note', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-700 text-white text-sm font-bold flex items-center justify-between">
          <span>Chi tiết luân chuyển ({effectiveLines.length} dòng)</span>
          <button type="button" onClick={() => setLines(p => [...p, newTransferLine(isEdit ? existingTransfer.id : transferNo, p.length)])}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs px-3 py-1 rounded">
            <Plus size={13} /> Thêm dòng
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-center py-2 px-2 w-8">#</th>
              <th className="text-center py-2 px-2 font-semibold">Thuốc *</th>
              <th className="text-center py-2 px-2 w-44 font-semibold">Lô hàng</th>
              <th className="text-center py-2 px-2 w-24 font-semibold">Hạn dùng</th>
              <th className="text-center py-2 px-2 w-16 font-semibold">Tồn lô</th>
              <th className="text-center py-2 px-1 w-20 font-semibold">SL chuyển *</th>
              <th className="py-2 px-2 w-8" />
            </tr></thead>
            <tbody>
              {lines.map((line, idx) => {
                const isBlank = !line.productId;
                const availBatches = line.productId ? getAvailBatches(line.productId) : [];
                const days = line.expiryDate ? daysLeft(line.expiryDate) : null;
                return (
                  <tr key={line.lineId} className={`border-b ${isBlank ? 'bg-gray-50/60' : ''}`}>
                    <td className="py-1.5 px-2 text-center text-xs text-gray-400">{isBlank ? '—' : idx + 1}</td>
                    <td className="py-1.5 px-2"><ProductSearchInput value={line.productName} onSelect={p => handleProductSelect(idx, p)} placeholder="Tên hoặc mã view..." /></td>
                    <td className="py-1.5 px-2">
                      <select value={line.batchId || ''} disabled={isBlank}
                        onChange={e => handleBatchSelect(idx, e.target.value || null)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-primary disabled:bg-gray-50">
                        <option value="">{isBlank ? '—' : availBatches.length === 0 ? 'Hết tồn' : 'Chọn lô...'}</option>
                        {availBatches.map(b => (
                          <option key={b.id} value={b.id}>{b.batchNo} | HH: {fmtDate(b.expiryDate)} | Còn: {b.remaining}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-center text-xs">
                      {line.expiryDate
                        ? <><div className={days < 0 ? 'text-red-600 font-bold' : days <= 30 ? 'text-orange-600' : 'text-gray-700'}>{fmtDate(line.expiryDate)}</div>
                          <div className={`text-[10px] ${days < 0 ? 'text-red-400' : days <= 30 ? 'text-orange-400' : 'text-gray-400'}`}>{days < 0 ? 'Đã HH' : `Còn ${days}n`}</div></>
                        : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-center text-xs font-bold">
                      {line.batchId ? <span className={line.maxQty <= 5 ? 'text-red-600' : 'text-gray-700'}>{line.maxQty}</span> : '—'}
                    </td>
                    <td className="py-1.5 px-1">
                      <input type="number" min={1} max={line.maxQty || undefined} value={line.quantity} disabled={isBlank}
                        onChange={e => updateLine(idx, 'quantity', e.target.value)}
                        className="w-full border border-gray-300 rounded px-1 py-1.5 text-xs text-right outline-none focus:border-primary disabled:bg-gray-50" />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button type="button" onClick={() => removeLine(idx)} disabled={lines.length === 1}
                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 rounded disabled:opacity-30"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={5} className="py-2.5 px-2 text-right text-xs font-bold text-gray-600">TỔNG SỐ LƯỢNG:</td>
              <td className="py-2.5 px-2 text-right text-sm font-black text-gray-800">{totalQty}</td>
              <td />
            </tr></tfoot>
          </table>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"><X size={15} className="flex-shrink-0" />{error}</div>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
          <ChevronLeft size={14} /> Quay lại
        </button>
        <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <Save size={16} />
          {isEdit ? 'Lưu thay đổi' : `Lưu phiếu luân chuyển${effectiveLines.length > 0 ? ` (${effectiveLines.length} dòng · ${totalQty} đvị)` : ''}`}
        </button>
      </div>
    </form>
  );
}

// ─── TransferTab ─────────────────────────────────────────────────
function TransferTab({ transfers, setTransfers, warehouses, batches, setBatches, user, nextTransferNo, onTransferSaved, askConfirm }) {
  const isAdmin = user?.role === 'admin';
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => transfers.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.id.toLowerCase().includes(q) || t.lines.some(l => l.productName?.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [transfers, filterStatus, search]);

  const handleSaveTransfer = (formData) => {
    if (view === 'edit' && selected) {
      setTransfers(prev => prev.map(t => t.id === selected.id ? { ...t, ...formData, updatedAt: new Date().toISOString() } : t));
      setSelected(null);
    } else {
      setTransfers(prev => [...prev, { id: nextTransferNo, status: 'draft', createdBy: user?.name, createdAt: new Date().toISOString(), updatedAt: null, approvedBy: null, approvedAt: null, ...formData }]);
      onTransferSaved();
    }
    setView('list');
  };

  const handleApproveTransfer = (transferId) => {
    const tr = transfers.find(t => t.id === transferId);
    if (!tr) return;
    // Giảm tồn kho nguồn theo từng dòng (kho đích không tạo lô mới trong mock)
    setBatches(prev => {
      let updated = [...prev];
      for (const line of tr.lines) {
        if (line.batchId) updated = updated.map(b => b.id === line.batchId ? { ...b, remaining: Math.max(0, b.remaining - (Number(line.quantity) || 0)) } : b);
      }
      return updated;
    });
    setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'approved', approvedBy: user?.name, approvedAt: new Date().toISOString() } : t));
    setView('list');
  };

  const handleRevokeTransfer = (transferId) => {
    const tr = transfers.find(t => t.id === transferId);
    if (!tr) return;
    askConfirm(`Hủy duyệt phiếu luân chuyển ${transferId}?\nTồn kho kho nguồn sẽ được hoàn trả.`, () => {
      setBatches(prev => {
        let updated = [...prev];
        for (const line of tr.lines) {
          if (line.batchId) updated = updated.map(b => b.id === line.batchId ? { ...b, remaining: b.remaining + (Number(line.quantity) || 0) } : b);
        }
        return updated;
      });
      setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'draft', approvedBy: null, approvedAt: null } : t));
      setView('list');
    });
  };

  const handleDeleteTransfer = (transferId) => {
    askConfirm('Xóa phiếu luân chuyển này?', () => {
      setTransfers(prev => prev.filter(t => t.id !== transferId));
      if (view !== 'list') setView('list');
    });
  };

  if (view === 'create' || view === 'edit') {
    return <TransferForm existingTransfer={view === 'edit' ? selected : null} transferNo={nextTransferNo}
      warehouses={warehouses} batches={batches} user={user}
      onSave={handleSaveTransfer} onCancel={() => { setView('list'); setSelected(null); }} />;
  }

  if (view === 'detail' && selected) {
    const tr = transfers.find(t => t.id === selected.id) || selected;
    const fromWh = warehouses.find(w => w.code === tr.fromWarehouseCode);
    const toWh = warehouses.find(w => w.code === tr.toWarehouseCode);
    const isDraft = tr.status === 'draft';
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView('list'); setSelected(null); }}
            className="flex items-center gap-1.5 text-gray-600 hover:text-primary text-sm"><ChevronLeft size={16} /> Danh sách phiếu luân chuyển</button>
          <div className="flex-1" />
          {isDraft && <button onClick={() => { setSelected(tr); setView('edit'); }}
            className="flex items-center gap-1.5 border border-amber-400 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 text-sm"><Edit2 size={14} /> Sửa</button>}
          {isDraft && isAdmin && <button onClick={() => handleApproveTransfer(tr.id)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"><Check size={14} /> Duyệt chuyển</button>}
          {!isDraft && isAdmin && <button onClick={() => handleRevokeTransfer(tr.id)}
            className="flex items-center gap-1.5 border border-orange-400 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 text-sm"><Ban size={14} /> Hủy duyệt</button>}
          {isDraft && <button onClick={() => handleDeleteTransfer(tr.id)}
            className="flex items-center gap-1.5 border border-red-300 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm"><Trash2 size={14} /> Xóa</button>}
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="font-bold text-sm">CHI TIẾT PHIẾU LUÂN CHUYỂN KHO</div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TRANSFER_STATUS[tr.status]?.cls}`}>{TRANSFER_STATUS[tr.status]?.label}</span>
              <code className="font-mono text-sm bg-white/20 px-3 py-0.5 rounded">{tr.id}</code>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[['Kho nguồn', fromWh?.name || '—'], ['Kho đích', toWh?.name || '—'], ['Ngày chuyển', fmtDatetime(tr.transferDatetime)],
            ['Người tạo', tr.createdBy], ['Ngày tạo', fmtDatetime(tr.createdAt)],
            tr.approvedBy && ['Người duyệt', tr.approvedBy], tr.approvedAt && ['Ngày duyệt', fmtDatetime(tr.approvedAt)]
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-400">{k}</div>
                <div className="text-gray-800 font-medium mt-0.5 text-xs">{v}</div>
              </div>
            ))}
          </div>
          {tr.note && <div className="px-4 pb-4 text-sm text-gray-500 italic">Ghi chú: {tr.note}</div>}
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-700 text-white px-4 py-2.5 text-sm font-bold">Chi tiết luân chuyển ({tr.lines.length} dòng)</div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-center py-2 px-3 w-8">STT</th>
              <th className="text-left py-2 px-3 font-semibold">Tên thuốc</th>
              <th className="text-left py-2 px-3 w-28 font-semibold">Số lô</th>
              <th className="text-center py-2 px-3 w-24 font-semibold">Hạn dùng</th>
              <th className="text-right py-2 px-3 w-20 font-semibold">SL chuyển</th>
            </tr></thead>
            <tbody>
              {tr.lines.map((l, i) => (
                <tr key={l.lineId} className={`border-b ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="py-2 px-3 text-center text-xs text-gray-500">{i + 1}</td>
                  <td className="py-2 px-3 font-medium text-gray-800">{l.productName}</td>
                  <td className="py-2 px-3"><code className="font-mono text-xs text-gray-600">{l.batchNo || '—'}</code></td>
                  <td className="py-2 px-3 text-center text-xs">{l.expiryDate ? fmtDate(l.expiryDate) : '—'}</td>
                  <td className="py-2 px-3 text-right font-bold">{l.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={4} className="py-2.5 px-3 text-right text-xs font-bold text-gray-600">TỔNG SỐ LƯỢNG:</td>
              <td className="py-2.5 px-3 text-right font-black">{tr.totalQty}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Số phiếu, tên thuốc..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        {[
          { key: 'all', label: `Tất cả (${transfers.length})` },
          { key: 'draft', label: `Chưa duyệt (${transfers.filter(t => t.status === 'draft').length})` },
          { key: 'approved', label: `Đã duyệt (${transfers.filter(t => t.status === 'approved').length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors ${filterStatus === f.key ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setView('create')}
          className="ml-auto flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          <PlusCircle size={15} /> Tạo phiếu luân chuyển
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm py-16 text-center text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <div className="font-medium">Chưa có phiếu luân chuyển nào</div>
          <button onClick={() => setView('create')} className="mt-3 text-blue-600 text-sm hover:underline">Tạo phiếu đầu tiên →</button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-left py-3 px-3 font-semibold w-28">Số phiếu</th>
              <th className="text-left py-3 px-3 font-semibold">Kho nguồn</th>
              <th className="text-left py-3 px-3 font-semibold">Kho đích</th>
              <th className="text-center py-3 px-3 font-semibold w-32">Ngày chuyển</th>
              <th className="text-center py-3 px-3 font-semibold w-16">Số dòng</th>
              <th className="text-right py-3 px-3 font-semibold w-20">Tổng SL</th>
              <th className="text-left py-3 px-3 font-semibold w-24">Người tạo</th>
              <th className="text-center py-3 px-3 font-semibold w-24">Trạng thái</th>
              <th className="text-center py-3 px-3 font-semibold w-24">Thao tác</th>
            </tr></thead>
            <tbody>
              {filtered.map(t => {
                const isDraft = t.status === 'draft';
                const fromWh = warehouses.find(w => w.code === t.fromWarehouseCode);
                const toWh = warehouses.find(w => w.code === t.toWarehouseCode);
                return (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{t.id}</code></td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{fromWh?.name || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{toWh?.name || '—'}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-gray-600">{fmtDatetime(t.transferDatetime)}</td>
                    <td className="py-2.5 px-3 text-center text-xs font-medium">{t.lines.length}</td>
                    <td className="py-2.5 px-3 text-right text-xs font-bold">{t.totalQty}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">{t.createdBy}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TRANSFER_STATUS[t.status]?.cls}`}>{TRANSFER_STATUS[t.status]?.label}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelected(t); setView('detail'); }} title="Xem chi tiết"
                          className="w-7 h-7 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded"><Eye size={14} /></button>
                        {isDraft && <button onClick={() => { setSelected(t); setView('edit'); }} title="Sửa"
                          className="w-7 h-7 flex items-center justify-center text-amber-500 hover:bg-amber-50 rounded"><Edit2 size={14} /></button>}
                        {isDraft && isAdmin && <button onClick={() => handleApproveTransfer(t.id)} title="Duyệt chuyển"
                          className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded"><Check size={14} /></button>}
                        {!isDraft && isAdmin && <button onClick={() => handleRevokeTransfer(t.id)} title="Hủy duyệt"
                          className="w-7 h-7 flex items-center justify-center text-orange-500 hover:bg-orange-50 rounded"><Ban size={14} /></button>}
                        {isDraft && <button onClick={() => handleDeleteTransfer(t.id)} title="Xóa"
                          className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 bg-gray-50 border-t text-xs text-gray-500">Hiển thị <strong>{filtered.length}</strong> phiếu</div>
        </div>
      )}
    </div>
  );
}


// ─── Trang chính ─────────────────────────────────────────────────
// initialTab: tab mặc định ('stock'|'receipts'|'exports'|'transfers'|'batch')
export default function Inventory({ initialTab = 'stock' }) {
  const { user, canUsePOS } = useAuth();
  const { products } = useProducts();
  const { reasons, setReasons, suppliers, setSuppliers, warehouses, setWarehouses, exportReasons, setExportReasons } = useCatalog();
  const isAdmin = user?.role === 'admin';

  const [batches, setBatches] = useState(initialBatches);
  const [receipts, setReceipts] = useState([]);
  const [exports, setExports] = useState([]);
  const [transfers, setTransfers] = useState([]);

  // Số phiếu tiếp theo — giữ ở parent để không tăng khi chuyển tab
  const [nextReceiptNo, setNextReceiptNo] = useState(peekNextReceiptNo);
  const [nextExportNo, setNextExportNo] = useState(peekNextExportNo);
  const [nextTransferNo, setNextTransferNo] = useState(peekNextTransferNo);
  const handleReceiptSaved = useCallback(() => { setNextReceiptNo(consumeReceiptNo()); }, []);
  const handleExportSaved = useCallback(() => { setNextExportNo(consumeExportNo()); }, []);
  const handleTransferSaved = useCallback(() => { setNextTransferNo(consumeTransferNo()); }, []);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [stockFilter, setStockFilter] = useState('all');

  // State dùng chung cho ConfirmDialog và AlertDialog — truyền xuống từng Tab
  const [confirmState, setConfirmState] = useState(null);
  const askConfirm = useCallback((msg, onOk) => setConfirmState({ msg, onOk }), []);
  const dismissConfirm = useCallback(() => setConfirmState(null), []);

  const [alertMsg, setAlertMsg] = useState('');
  const showError = useCallback((msg) => setAlertMsg(msg), []);

  if (!user) return <Navigate to="/tai-khoan" replace />;
  if (!canUsePOS) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Không có quyền truy cập</h2>
    </div>
  );

  const summary = getStockSummary(products);
  const warningCount = summary.filter(s => s.status !== 'ok').length;
  const draftCount = receipts.filter(r => r.status === 'draft').length;
  const exportDraftCount = exports.filter(e => e.status === 'draft').length;
  const transferDraftCount = transfers.filter(t => t.status === 'draft').length;

  const tabs = [
    { key: 'stock',     label: '📦 Tồn kho' },
    { key: 'batch',     label: '🗂️ Lô hàng' },
    { key: 'receipts',  label: '📋 Phiếu nhập' },
    { key: 'exports',   label: '📤 Xuất kho' },
    { key: 'transfers', label: '🔄 Luân chuyển' },
  ];

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>›</span>
        <span className="text-primary font-medium">Quản lý kho</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Quản lý kho</h1>
          <p className="text-xs text-gray-500 mt-0.5">Tồn kho · Lô hàng · Hạn sử dụng · Nhập / Xuất / Luân chuyển</p>
        </div>
        {warningCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-amber-700 font-medium">{warningCount} sản phẩm cần chú ý</span>
            <button onClick={() => { setActiveTab('stock'); setStockFilter('warning'); }} className="text-primary text-xs hover:underline">Xem →</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex border-b overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}>
              {t.label}
              {t.key === 'stock' && warningCount > 0 && <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{warningCount}</span>}
              {t.key === 'receipts' && draftCount > 0 && <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{draftCount}</span>}
              {t.key === 'exports' && exportDraftCount > 0 && <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{exportDraftCount}</span>}
              {t.key === 'transfers' && transferDraftCount > 0 && <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{transferDraftCount}</span>}
            </button>
          ))}
        </div>
        <div className="p-4">
          {activeTab === 'stock' && <StockTab filter={stockFilter} setFilter={setStockFilter} />}
          {activeTab === 'batch' && <BatchTab batchList={batches} />}
          {activeTab === 'receipts' && (
            <ReceiptsTab
              receipts={receipts} setReceipts={setReceipts}
              reasons={reasons} suppliers={suppliers} warehouses={warehouses}
              batches={batches}
              user={user}
              nextReceiptNo={nextReceiptNo}
              onReceiptSaved={handleReceiptSaved}
              askConfirm={askConfirm}
              showError={showError}
            />
          )}
          {activeTab === 'exports' && (
            <ExportTab
              exports={exports} setExports={setExports}
              exportReasons={exportReasons}
              warehouses={warehouses}
              batches={batches} setBatches={setBatches}
              user={user}
              nextExportNo={nextExportNo}
              onExportSaved={handleExportSaved}
              askConfirm={askConfirm}
            />
          )}
          {activeTab === 'transfers' && (
            <TransferTab
              transfers={transfers} setTransfers={setTransfers}
              warehouses={warehouses}
              batches={batches} setBatches={setBatches}
              user={user}
              nextTransferNo={nextTransferNo}
              onTransferSaved={handleTransferSaved}
              askConfirm={askConfirm}
            />
          )}
        </div>
      </div>

      {/* Dialog xác nhận — try-finally đảm bảo luôn đóng kể cả khi onOk throw */}
      {confirmState && (
        <ConfirmDialog
          message={confirmState.msg}
          onConfirm={() => { try { confirmState.onOk(); } finally { dismissConfirm(); } }}
          onCancel={dismissConfirm}
        />
      )}

      {/* Dialog thông báo lỗi nghiệp vụ */}
      {alertMsg && (
        <AlertDialog
          message={alertMsg}
          onClose={() => setAlertMsg('')}
        />
      )}
    </div>
  );
}
