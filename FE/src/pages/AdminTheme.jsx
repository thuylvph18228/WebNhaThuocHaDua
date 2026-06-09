import { useState } from 'react';
import { Palette, RotateCcw, Save, Check, Eye } from 'lucide-react';
import { useTheme, DEFAULT_THEME, applyCSSVars } from '../context/ThemeContext';

// Bộ màu preset nhanh
const PRESETS = [
  {
    name: 'Xanh y tế',
    colorPrimary: '#00a651', colorPrimaryDark: '#007a3d', colorPrimaryLight: '#e8f5ee',
    colorSecondary: '#f26522',
    colorHeaderBg: '#ffffff', colorFooterBg: '#1f2937', colorFooterText: '#d1d5db',
    colorBtnAdd: '#16a34a', colorBtnEdit: '#2563eb', colorBtnDelete: '#dc2626',
    colorBtnPrint: '#7c3aed', colorBtnView: '#0891b2',
  },
  {
    name: 'Xanh dương',
    colorPrimary: '#1d4ed8', colorPrimaryDark: '#1e3a8a', colorPrimaryLight: '#eff6ff',
    colorSecondary: '#f59e0b',
    colorHeaderBg: '#ffffff', colorFooterBg: '#1e3a8a', colorFooterText: '#bfdbfe',
    colorBtnAdd: '#16a34a', colorBtnEdit: '#0284c7', colorBtnDelete: '#dc2626',
    colorBtnPrint: '#7c3aed', colorBtnView: '#0891b2',
  },
  {
    name: 'Tím',
    colorPrimary: '#7c3aed', colorPrimaryDark: '#5b21b6', colorPrimaryLight: '#f5f3ff',
    colorSecondary: '#ec4899',
    colorHeaderBg: '#ffffff', colorFooterBg: '#1e1b4b', colorFooterText: '#c4b5fd',
    colorBtnAdd: '#16a34a', colorBtnEdit: '#2563eb', colorBtnDelete: '#dc2626',
    colorBtnPrint: '#7c3aed', colorBtnView: '#0891b2',
  },
  {
    name: 'Đỏ',
    colorPrimary: '#dc2626', colorPrimaryDark: '#991b1b', colorPrimaryLight: '#fef2f2',
    colorSecondary: '#f97316',
    colorHeaderBg: '#ffffff', colorFooterBg: '#1c1917', colorFooterText: '#d6d3d1',
    colorBtnAdd: '#16a34a', colorBtnEdit: '#2563eb', colorBtnDelete: '#dc2626',
    colorBtnPrint: '#7c3aed', colorBtnView: '#0891b2',
  },
  {
    name: 'Tối',
    colorPrimary: '#22d3ee', colorPrimaryDark: '#0891b2', colorPrimaryLight: '#0f172a',
    colorSecondary: '#f59e0b',
    colorHeaderBg: '#111827', colorFooterBg: '#030712', colorFooterText: '#9ca3af',
    colorBtnAdd: '#16a34a', colorBtnEdit: '#2563eb', colorBtnDelete: '#dc2626',
    colorBtnPrint: '#7c3aed', colorBtnView: '#0891b2',
  },
];

// Ô chọn màu — color picker native + input hex
function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-gray-600 w-28 flex-shrink-0">{label}</span>
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white flex-shrink-0"
      />
      <input
        type="text"
        value={value.toUpperCase()}
        onChange={e => {
          const v = e.target.value;
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
        }}
        className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-primary bg-gray-50"
        maxLength={7}
      />
      <div className="w-7 h-7 rounded-lg border border-gray-200 shadow-inner flex-shrink-0" style={{ background: value }} />
    </div>
  );
}

// Section card dùng chung
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminTheme() {
  const { theme: savedTheme, saveTheme, resetTheme } = useTheme();
  const [draft, setDraft] = useState({ ...savedTheme });
  const [savedFlag, setSavedFlag] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedTheme);

  // Cập nhật 1 key + áp dụng preview trực tiếp lên toàn app
  const update = (key, value) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    applyCSSVars(next);
    setSavedFlag(false);
  };

  const applyPreset = ({ name: _n, ...colors }) => {
    const next = { ...draft, ...colors };
    setDraft(next);
    applyCSSVars(next);
    setSavedFlag(false);
  };

  const handleSave = () => {
    saveTheme(draft);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 2500);
  };

  const handleDiscard = () => {
    setDraft({ ...savedTheme });
    applyCSSVars(savedTheme);
  };

  const handleReset = () => {
    resetTheme();
    setDraft({ ...DEFAULT_THEME });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">

      {/* Tiêu đề + nút lưu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
            <Palette size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Thiết kế giao diện</h1>
            <p className="text-xs text-gray-400 mt-0.5">Thay đổi màu sắc áp dụng trực tiếp — nhấn Lưu để cố định</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleReset}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors">
            <RotateCcw size={13} /> Về mặc định
          </button>
          {isDirty && (
            <button onClick={handleDiscard}
              className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors">
              Hủy thay đổi
            </button>
          )}
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              savedFlag
                ? 'bg-green-500 text-white scale-95'
                : 'text-white hover:opacity-90'
            }`}
            style={!savedFlag ? { background: 'var(--color-primary)' } : {}}>
            {savedFlag ? <><Check size={14} /> Đã lưu!</> : <><Save size={14} /> Lưu thay đổi</>}
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
          <Eye size={15} />
          Đang xem trước — thay đổi chưa được lưu. Nhấn <strong className="mx-1">Lưu thay đổi</strong> để áp dụng vĩnh viễn.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* ─── Cột trái: cài đặt màu ─── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Bộ màu nhanh */}
          <Section title="Bộ màu nhanh">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="flex items-center gap-2 border border-gray-200 hover:border-primary rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-primary-light hover:text-primary">
                  <span className="flex gap-0.5">
                    <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: p.colorPrimary }} />
                    <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: p.colorSecondary }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </Section>

          {/* Màu thương hiệu */}
          <Section title="Màu thương hiệu">
            <ColorRow label="Màu chính" value={draft.colorPrimary} onChange={v => update('colorPrimary', v)} />
            <ColorRow label="Chính (tối)" value={draft.colorPrimaryDark} onChange={v => update('colorPrimaryDark', v)} />
            <ColorRow label="Chính (nhạt)" value={draft.colorPrimaryLight} onChange={v => update('colorPrimaryLight', v)} />
            <ColorRow label="Màu phụ (cam)" value={draft.colorSecondary} onChange={v => update('colorSecondary', v)} />
          </Section>

          {/* Khung trang */}
          <Section title="Khung trang (Header / Footer)">
            <ColorRow label="Header nền" value={draft.colorHeaderBg} onChange={v => update('colorHeaderBg', v)} />
            <ColorRow label="Footer nền" value={draft.colorFooterBg} onChange={v => update('colorFooterBg', v)} />
            <ColorRow label="Footer chữ" value={draft.colorFooterText} onChange={v => update('colorFooterText', v)} />
          </Section>

          {/* Nút hành động */}
          <Section title="Nút hành động">
            <ColorRow label="Nút Thêm +" value={draft.colorBtnAdd} onChange={v => update('colorBtnAdd', v)} />
            <ColorRow label="Nút Sửa ✏" value={draft.colorBtnEdit} onChange={v => update('colorBtnEdit', v)} />
            <ColorRow label="Nút Xóa 🗑" value={draft.colorBtnDelete} onChange={v => update('colorBtnDelete', v)} />
            <ColorRow label="Nút In 🖨" value={draft.colorBtnPrint} onChange={v => update('colorBtnPrint', v)} />
            <ColorRow label="Nút Xem 👁" value={draft.colorBtnView} onChange={v => update('colorBtnView', v)} />
          </Section>
        </div>

        {/* ─── Cột phải: xem trước ─── */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Xem trước trực tiếp
            </h3>

            {/* Header mockup */}
            <div className="rounded-xl overflow-hidden border border-gray-200 mb-4 shadow-sm">
              {/* Top bar */}
              <div className="px-4 py-1.5 text-xs flex justify-between items-center"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, black)', color: 'rgba(255,255,255,0.85)' }}>
                <span>Hotline: 1900-0062</span>
                <span>Đăng nhập | Đăng ký</span>
              </div>
              {/* Header main */}
              <div className="flex items-center gap-3 px-4 py-3"
                style={{ background: 'var(--color-header-bg)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm"
                  style={{ background: 'var(--color-primary)' }}>HĐ</div>
                <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>Nhà Thuốc Hà Đua</span>
                <div className="flex-1" />
                <div className="h-8 w-36 rounded-lg border text-xs flex items-center px-2 text-gray-400 bg-gray-50 border-gray-200">
                  🔍 Tìm kiếm...
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  🛒
                </div>
              </div>
              {/* Nav */}
              <div className="flex gap-6 px-5 py-2.5"
                style={{ background: 'var(--color-primary)' }}>
                {['Trang chủ', 'Sản phẩm', 'Tin tức', 'Liên hệ'].map(n => (
                  <span key={n} className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{n}</span>
                ))}
              </div>
            </div>

            {/* Nội dung mẫu */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700 text-sm">Quản lý sản phẩm</span>
                <button className="text-xs text-white px-3 py-1.5 rounded-lg font-medium shadow-sm"
                  style={{ background: 'var(--color-btn-add)' }}>
                  + Thêm mới
                </button>
              </div>

              {/* Mini product cards */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['Panadol Extra', 'Vitamin C 1000mg', 'Omega-3'].map((n, i) => (
                  <div key={n} className="bg-white rounded-lg border border-gray-100 p-2.5 shadow-sm">
                    <div className="w-full h-1 rounded-full mb-2" style={{ background: 'var(--color-primary-light)' }}>
                      <div className="h-full rounded-full" style={{ background: 'var(--color-primary)', width: `${70 - i * 15}%` }} />
                    </div>
                    <div className="text-xs font-medium text-gray-700 leading-tight">{n}</div>
                    <div className="text-xs font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                      {(125000 + i * 50000).toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                ))}
              </div>

              {/* Nút hành động */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '+ Thêm', key: 'colorBtnAdd' },
                  { label: '✏ Sửa', key: 'colorBtnEdit' },
                  { label: '🗑 Xóa', key: 'colorBtnDelete' },
                  { label: '🖨 In', key: 'colorBtnPrint' },
                  { label: '👁 Xem', key: 'colorBtnView' },
                ].map(b => (
                  <button key={b.key}
                    className="text-xs text-white px-3 py-1.5 rounded-lg font-medium shadow-sm"
                    style={{ background: `var(--color-${b.key.replace('color', '').replace(/([A-Z])/g, m => '-' + m.toLowerCase()).replace(/^-/, '')})` }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge màu */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: 'Màu chính', bg: 'var(--color-primary)', color: '#fff' },
                { label: 'Tối', bg: 'var(--color-primary-dark)', color: '#fff' },
                { label: 'Nhạt', bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
                { label: 'Màu phụ', bg: 'var(--color-secondary)', color: '#fff' },
              ].map(b => (
                <span key={b.label} className="text-xs px-3 py-1 rounded-full font-medium shadow-sm"
                  style={{ background: b.bg, color: b.color }}>
                  {b.label}
                </span>
              ))}
            </div>

            {/* Footer mockup */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 grid grid-cols-2 gap-4"
                style={{ background: 'var(--color-footer-bg)', color: 'var(--color-footer-text)' }}>
                <div>
                  <div className="font-bold text-sm mb-1">Nhà Thuốc Hà Đua</div>
                  <div className="text-xs opacity-70 leading-relaxed">
                    123 Đường ABC, Quận 1<br />TP. Thanh Hóa<br />1900-0062
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-xs mb-2 opacity-80">Liên kết nhanh</div>
                  {['Sản phẩm', 'Về chúng tôi', 'Liên hệ'].map(n => (
                    <div key={n} className="text-xs opacity-60 mb-1">{n}</div>
                  ))}
                </div>
              </div>
              <div className="px-5 py-2 text-xs text-center"
                style={{ background: 'var(--color-footer-bg)', color: 'var(--color-footer-text)', borderTop: '1px solid rgba(255,255,255,0.1)', opacity: 0.6 }}>
                © 2026 Nhà Thuốc Hà Đua · Giấy phép: 0123456789
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
