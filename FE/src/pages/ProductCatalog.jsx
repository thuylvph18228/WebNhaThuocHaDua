import { useState, useMemo, useRef, useCallback } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  Search, Plus, X, Edit2, Trash2, ToggleLeft, ToggleRight,
  Upload, Package, ChevronLeft, ChevronRight, Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useCatalog } from '../context/CatalogContext';
import { categories } from '../data/mockData';

const PAGE_SIZE = 10;

function fmt(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

const catOptions = categories.flatMap(c => [
  { slug: c.slug, label: c.name, icon: c.icon },
  ...(c.children || []).map(sub => ({ slug: sub.slug, label: `└ ${sub.name}`, icon: '' })),
]);

// ─── Form thêm / sửa sản phẩm ────────────────────────────────────
function ProductForm({ product, onSave, onCancel }) {
  const isEdit = !!product;
  const blank = () => ({
    name: '', maview: '', price: '', originalPrice: '',
    category: categories[0]?.slug || '', brand: '',
    isRx: false, badge: '', manufacturer: '', origin: '',
    registrationNo: '', activeIngredient: '', description: '', image: '',
  });
  const [form, setForm] = useState(product ? { ...product } : blank());
  const [error, setError] = useState('');
  const [imgMode, setImgMode] = useState(product?.image?.startsWith('data:') ? 'file' : 'url');
  const fileRef = useRef(null);

  const setF = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError('Ảnh phải nhỏ hơn 3MB'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = ev => { setF('image', ev.target.result); setImgMode('file'); };
    reader.readAsDataURL(file);
  };

  const clearImage = () => { setF('image', ''); setImgMode('url'); if (fileRef.current) fileRef.current.value = ''; };

  const handleSave = () => {
    setError('');
    if (!form.name?.trim())   { setError('Tên thuốc là bắt buộc'); return; }
    if (!form.maview?.trim()) { setError('Mã barcode (maview) là bắt buộc'); return; }
    if (!form.price || Number(form.price) <= 0) { setError('Giá bán phải > 0'); return; }
    if (!form.category)       { setError('Vui lòng chọn danh mục'); return; }
    const catName = catOptions.find(c => c.slug === form.category)?.label?.replace(/^└\s*/, '').trim() || form.category;
    onSave({ ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price), isRx: !!form.isRx, categoryName: catName, stock: form.stock ? Number(form.stock) : 100 });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-sm">{isEdit ? `Chỉnh sửa: ${product.name}` : 'Thêm sản phẩm mới'}</div>
        <button onClick={onCancel} className="hover:bg-white/20 rounded p-1"><X size={16}/></button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tên thuốc <span className="text-red-500">*</span></label>
            <input autoFocus value={form.name} onChange={e => setF('name', e.target.value)} placeholder="VD: Paracetamol 500mg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mã barcode (maview) <span className="text-red-500">*</span></label>
            <input value={form.maview} onChange={e => setF('maview', e.target.value.toUpperCase())} placeholder="VD: PANA24"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary font-mono"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Danh mục <span className="text-red-500">*</span></label>
            <select value={form.category} onChange={e => setF('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">— Chọn —</option>
              {catOptions.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Thương hiệu</label>
            <input value={form.brand} onChange={e => setF('brand', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Giá bán (đ) <span className="text-red-500">*</span></label>
            <input type="number" min={0} value={form.price} onChange={e => setF('price', e.target.value)} placeholder="VD: 35000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Giá gốc (đ)</label>
            <input type="number" min={0} value={form.originalPrice} onChange={e => setF('originalPrice', e.target.value)} placeholder="Để trống = giá bán"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nhà sản xuất</label>
            <input value={form.manufacturer} onChange={e => setF('manufacturer', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Xuất xứ</label>
            <input value={form.origin} onChange={e => setF('origin', e.target.value)} placeholder="VD: Việt Nam"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nhãn (badge)</label>
            <select value={form.badge} onChange={e => setF('badge', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Không có</option>
              <option value="Bán chạy">🔥 Bán chạy</option>
              <option value="Mới">✨ Mới</option>
              <option value="Khuyến mãi">🏷️ Khuyến mãi</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="chk-rx" checked={!!form.isRx} onChange={e => setF('isRx', e.target.checked)} className="w-4 h-4 accent-primary"/>
            <label htmlFor="chk-rx" className="text-sm font-semibold text-gray-700 cursor-pointer">Thuốc kê đơn (Rx)</label>
          </div>
          {form.isRx && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Số đăng ký</label>
              <input value={form.registrationNo} onChange={e => setF('registrationNo', e.target.value)} placeholder="VD: VD-12345-11"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary font-mono"/>
            </div>
          )}
          {form.isRx && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hoạt chất</label>
              <input value={form.activeIngredient} onChange={e => setF('activeIngredient', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
            </div>
          )}

          {/* Ảnh sản phẩm */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-600 mb-2">Ảnh sản phẩm</label>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {form.image
                  ? <img src={form.image} alt="preview" className="w-full h-full object-contain"/>
                  : <Package size={28} className="text-gray-300"/>}
              </div>
              <div className="flex-1 space-y-2">
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-primary rounded-lg px-3 py-2.5 cursor-pointer hover:bg-primary-light transition-colors text-sm text-primary font-medium">
                  <Upload size={15}/>
                  Tải ảnh từ máy tính
                  <span className="text-xs text-gray-400 font-normal">(JPG, PNG, WEBP — tối đa 3MB)</span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile}/>
                </label>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 flex-shrink-0">hoặc dán URL:</span>
                  <input value={imgMode === 'url' ? (form.image || '') : ''} onChange={e => { setF('image', e.target.value); setImgMode('url'); }}
                    placeholder="https://..." className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary"/>
                  {form.image && <button type="button" onClick={clearImage} className="text-gray-400 hover:text-red-500"><X size={14}/></button>}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
            <textarea value={form.description} onChange={e => setF('description', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"/>
          </div>
        </div>

        {error && <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm"><X size={14}/>{error}</div>}
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">Hủy</button>
          <button onClick={handleSave} className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark text-sm flex items-center justify-center gap-2">
            <Save size={15}/>{isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Danh sách sản phẩm (có phân trang) ──────────────────────────
function ProductSection() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductActive } = useProducts();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = products;
    if (catFilter) list = list.filter(p => p.category === catFilter || p.categoryName?.includes(catFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.maview?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, search, catFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset về trang 1 khi filter thay đổi
  const setSearch2 = v => { setSearch(v); setPage(1); };
  const setCatFilter2 = v => { setCatFilter(v); setPage(1); };

  const editingProduct = editingId && editingId !== 'new' ? products.find(p => p.id === editingId) : null;

  const handleSave = (data) => {
    if (editingId === 'new') addProduct(data);
    else updateProduct(editingId, data);
    setEditingId(null);
  };

  const handleDelete = (p) => {
    if (window.confirm(`Xóa sản phẩm "${p.name}"?\nHành động này không thể hoàn tác.`)) {
      deleteProduct(p.id);
      if (editingId === p.id) setEditingId(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch2(e.target.value)} placeholder="Tìm tên, mã view, thương hiệu..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"/>
        </div>
        <select value={catFilter} onChange={e => setCatFilter2(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">{products.filter(p => !p.active).length} ẩn</span>
          <button onClick={() => setEditingId('new')} disabled={!!editingId}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm font-medium disabled:opacity-50">
            <Plus size={15}/> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Form thêm/sửa */}
      {editingId && <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setEditingId(null)}/>}

      {/* Bảng */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-center py-3 px-3 w-10">STT</th>
              <th className="py-3 px-3 w-14">Ảnh</th>
              <th className="text-center py-3 px-3 w-20">Mã view</th>
              <th className="text-left py-3 px-3">Tên thuốc</th>
              <th className="text-left py-3 px-3 w-36">Danh mục</th>
              <th className="text-right py-3 px-3 w-28">Giá bán</th>
              <th className="text-center py-3 px-3 w-12">Rx</th>
              <th className="text-center py-3 px-3 w-20">Nhãn</th>
              <th className="text-center py-3 px-3 w-24">Hiển thị</th>
              <th className="py-3 px-3 w-20"/>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-12 text-gray-400">
                <Package size={36} className="mx-auto mb-2 opacity-30"/>Không có sản phẩm nào
              </td></tr>
            ) : paged.map((p, idx) => (
              <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!p.active ? 'opacity-50' : ''} ${editingId === p.id ? 'bg-primary-light' : ''}`}>
                <td className="py-2.5 px-3 text-center text-xs text-gray-500">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="py-2.5 px-3">
                  <div className="w-10 h-10 rounded border bg-gray-50 flex items-center justify-center overflow-hidden">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-contain"/> : <Package size={16} className="text-gray-300"/>}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <code className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">{p.maview || '—'}</code>
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.brand}{p.manufacturer ? ` · ${p.manufacturer}` : ''}</div>
                </td>
                <td className="py-2.5 px-3 text-xs text-gray-600">{p.categoryName || p.category}</td>
                <td className="py-2.5 px-3 text-right">
                  <div className="font-bold text-primary">{fmt(p.price)}</div>
                  {p.originalPrice > p.price && <div className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</div>}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {p.isRx ? <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Rx</span> : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {p.badge ? <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">{p.badge}</span> : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button onClick={() => toggleProductActive(p.id)}
                    className={`flex items-center gap-1 mx-auto text-xs font-medium transition-colors ${p.active ? 'text-green-600 hover:text-gray-500' : 'text-gray-400 hover:text-green-600'}`}>
                    {p.active ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                    {p.active ? 'Hiện' : 'Ẩn'}
                  </button>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => setEditingId(editingId === p.id ? null : p.id)} title="Sửa"
                      className={`p-1.5 rounded transition-colors ${editingId === p.id ? 'text-primary bg-primary-light' : 'text-gray-400 hover:text-primary hover:bg-primary-light'}`}>
                      <Edit2 size={14}/>
                    </button>
                    <button onClick={() => handleDelete(p)} title="Xóa"
                      className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer: thông tin + phân trang */}
        <div className="px-4 py-2.5 bg-gray-50 border-t flex items-center justify-between">
          <span className="text-xs text-gray-500">
            <strong>{filtered.length}</strong> / {products.length} sản phẩm
            {products.filter(p => !p.active).length > 0 && <span className="ml-2 text-amber-600">· {products.filter(p => !p.active).length} đang ẩn</span>}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronLeft size={13}/>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium border transition-colors ${n === page ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronRight size={13}/>
              </button>
              <span className="text-xs text-gray-400 ml-1">Trang {page}/{totalPages}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bảng CRUD chung cho danh mục đơn giản ──────────────────────
function SimpleCrudTable({ title, items, setItems, fields }) {
  const [editing, setEditing] = useState(null); // null | 'new' | code
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');

  const nextCode = () => items.length === 0 ? 1 : Math.max(...items.map(i => Number(i.code))) + 1;

  const startNew = () => {
    setForm({ active: true, ...Object.fromEntries(fields.map(f => [f.key, f.default ?? ''])) });
    setEditing('new'); setErr('');
  };
  const startEdit = item => { setForm({ ...item }); setEditing(item.code); setErr(''); };
  const cancel = () => { setEditing(null); setErr(''); };

  const save = () => {
    for (const f of fields) {
      if (f.required && !form[f.key]?.toString().trim()) { setErr(`"${f.label}" là bắt buộc`); return; }
    }
    if (editing === 'new') {
      setItems(prev => [...prev, { code: nextCode(), ...form, active: true }]);
    } else {
      setItems(prev => prev.map(i => i.code === editing ? { ...i, ...form, code: i.code } : i));
    }
    cancel();
  };

  const toggleActive = code => setItems(prev => prev.map(i => i.code === code ? { ...i, active: !i.active } : i));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-700 text-sm">{title}</h4>
        <button onClick={startNew} className="flex items-center gap-1.5 bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary-dark">
          <Plus size={13}/> Thêm mới
        </button>
      </div>
      {err && <div className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-1.5 rounded mb-2 flex items-center gap-1"><X size={12}/>{err}</div>}
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-t">
          <th className="text-center py-2 px-3 font-semibold w-16">Mã</th>
          {fields.map(f => <th key={f.key} className="text-left py-2 px-3 font-semibold">{f.label}</th>)}
          <th className="text-center py-2 px-3 font-semibold w-24">Trạng thái</th>
          <th className="py-2 px-3 w-20"/>
        </tr></thead>
        <tbody>
          {editing === 'new' && (
            <tr className="border-b bg-green-50">
              <td className="py-2 px-3 text-center">
                <span className="inline-block bg-gray-200 text-gray-600 font-mono text-xs px-2 py-1 rounded">{nextCode()}</span>
              </td>
              {fields.map(f => (
                <td key={f.key} className="py-2 px-3">
                  {f.type === 'checkbox'
                    ? <input type="checkbox" checked={!!form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))}/>
                    : <input value={form[f.key] || ''} autoFocus onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-primary"/>}
                </td>
              ))}
              <td/>
              <td className="py-2 px-3">
                <div className="flex gap-1">
                  <button onClick={save} className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark">Lưu</button>
                  <button onClick={cancel} className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">Hủy</button>
                </div>
              </td>
            </tr>
          )}
          {items.map(item => (
            <tr key={item.code} className={`border-b hover:bg-gray-50 ${!item.active ? 'opacity-50' : ''}`}>
              <td className="py-2 px-3 text-center">
                <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{item.code}</code>
              </td>
              {fields.map(f => (
                <td key={f.key} className="py-2 px-3">
                  {editing === item.code
                    ? f.type === 'checkbox'
                      ? <input type="checkbox" checked={!!form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))}/>
                      : <input value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-primary"/>
                    : f.type === 'checkbox'
                      ? <span className="text-xs">{item[f.key] ? '✅ Có' : '—'}</span>
                      : <span className="text-xs text-gray-700">{item[f.key]}</span>}
                </td>
              ))}
              <td className="py-2 px-3 text-center">
                <button onClick={() => toggleActive(item.code)}
                  className={`flex items-center gap-1 mx-auto text-xs font-medium ${item.active ? 'text-green-600 hover:text-gray-500' : 'text-gray-400 hover:text-green-600'}`}>
                  {item.active ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                  {item.active ? 'Đang dùng' : 'Tắt'}
                </button>
              </td>
              <td className="py-2 px-3">
                {editing === item.code
                  ? <div className="flex gap-1">
                      <button onClick={save} className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark">Lưu</button>
                      <button onClick={cancel} className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">Hủy</button>
                    </div>
                  : <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-primary p-1 transition-colors"><Edit2 size={14}/></button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={fields.length + 3} className="text-center py-8 text-gray-400 text-xs">Chưa có dữ liệu</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Cấu hình các trang danh mục ────────────────────────────────
const SECTIONS = [
  { path: '/danh-muc/san-pham',     label: '💊 Sản phẩm',     key: 'products' },
  { path: '/danh-muc/ly-do-nhap',   label: '📋 Lý do nhập',   key: 'reasons' },
  { path: '/danh-muc/ly-do-xuat',   label: '📤 Lý do xuất',   key: 'exportReasons' },
  { path: '/danh-muc/nha-cung-cap', label: '🏢 Nhà cung cấp', key: 'suppliers' },
  { path: '/danh-muc/kho-hang',     label: '🏭 Kho hàng',     key: 'warehouses' },
];

export default function ProductCatalog() {
  const { user } = useAuth();
  const { reasons, setReasons, suppliers, setSuppliers, warehouses, setWarehouses, exportReasons, setExportReasons } = useCatalog();
  const { pathname } = useLocation();

  if (!user || user.role !== 'admin') return <Navigate to="/tai-khoan" replace />;

  const active = SECTIONS.find(s => s.path === pathname) || SECTIONS[0];

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>›</span>
        <Link to="/danh-muc/san-pham" className="hover:text-primary">Danh mục</Link>
        <span>›</span>
        <span className="text-primary font-medium">{active.label}</span>
      </div>

      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-800">Quản lý danh mục</h1>
        <p className="text-xs text-gray-500 mt-0.5">Sản phẩm · Lý do nhập/xuất · Nhà cung cấp · Kho hàng</p>
      </div>

      {/* Nav — dùng Link thay button, mỗi mục là URL riêng */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex border-b overflow-x-auto">
          {SECTIONS.map(s => (
            <Link key={s.path} to={s.path}
              className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${pathname === s.path ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}>
              {s.label}
            </Link>
          ))}
        </div>
        <div className="p-4">
          {active.key === 'products' && <ProductSection/>}
          {active.key === 'reasons' && (
            <SimpleCrudTable title="Lý do nhập hàng" items={reasons} setItems={setReasons}
              fields={[{ key: 'name', label: 'Tên lý do', required: true }, { key: 'requiresInvoice', label: 'Bắt buộc HĐ?', type: 'checkbox' }]}/>
          )}
          {active.key === 'exportReasons' && (
            <SimpleCrudTable title="Lý do xuất hàng" items={exportReasons} setItems={setExportReasons}
              fields={[{ key: 'name', label: 'Tên lý do', required: true }]}/>
          )}
          {active.key === 'suppliers' && (
            <SimpleCrudTable title="Nhà cung cấp" items={suppliers} setItems={setSuppliers}
              fields={[{ key: 'name', label: 'Tên nhà cung cấp', required: true }]}/>
          )}
          {active.key === 'warehouses' && (
            <SimpleCrudTable title="Kho hàng" items={warehouses} setItems={setWarehouses}
              fields={[{ key: 'name', label: 'Tên kho', required: true }]}/>
          )}
        </div>
      </div>
    </div>
  );
}
