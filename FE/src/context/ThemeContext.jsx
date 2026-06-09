import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const THEME_KEY = 'hadua_theme';

export const DEFAULT_THEME = {
  colorPrimary: '#00a651',
  colorPrimaryDark: '#007a3d',
  colorPrimaryLight: '#e8f5ee',
  colorSecondary: '#f26522',
  colorHeaderBg: '#ffffff',
  colorFooterBg: '#1f2937',
  colorFooterText: '#d1d5db',
  colorBtnAdd: '#16a34a',
  colorBtnEdit: '#2563eb',
  colorBtnDelete: '#dc2626',
  colorBtnPrint: '#7c3aed',
  colorBtnView: '#0891b2',
};

// Áp dụng theme — 2 cơ chế song song:
// 1. CSS variables (cho inline style="var(--color-primary)")
// 2. Inject <style> tag override Tailwind classes (đảm bảo hoạt động bất kể browser cache CSS)
export function applyCSSVars(t) {
  // ── CSS variables ──
  const r = document.documentElement;
  r.style.setProperty('--color-primary', t.colorPrimary);
  r.style.setProperty('--color-primary-dark', t.colorPrimaryDark);
  r.style.setProperty('--color-primary-light', t.colorPrimaryLight);
  r.style.setProperty('--color-secondary', t.colorSecondary);
  r.style.setProperty('--color-header-bg', t.colorHeaderBg);
  r.style.setProperty('--color-footer-bg', t.colorFooterBg);
  r.style.setProperty('--color-footer-text', t.colorFooterText);
  r.style.setProperty('--color-btn-add', t.colorBtnAdd);
  r.style.setProperty('--color-btn-edit', t.colorBtnEdit);
  r.style.setProperty('--color-btn-delete', t.colorBtnDelete);
  r.style.setProperty('--color-btn-print', t.colorBtnPrint);
  r.style.setProperty('--color-btn-view', t.colorBtnView);

  // ── Style tag override — win over compiled Tailwind CSS ──
  const styleId = 'hadua-theme-override';
  let el = document.getElementById(styleId);
  if (!el) {
    el = document.createElement('style');
    el.id = styleId;
    document.head.appendChild(el);
  }

  const p  = t.colorPrimary;
  const pd = t.colorPrimaryDark;
  const pl = t.colorPrimaryLight;
  const s  = t.colorSecondary;
  const hb = t.colorHeaderBg;
  const fb = t.colorFooterBg;
  const ft = t.colorFooterText;
  const ba = t.colorBtnAdd;
  const be = t.colorBtnEdit;
  const bd = t.colorBtnDelete;
  const bp = t.colorBtnPrint;
  const bv = t.colorBtnView;

  el.textContent = `
    /* Background */
    .bg-primary{background-color:${p}!important}
    .bg-primary-dark{background-color:${pd}!important}
    .bg-primary-light{background-color:${pl}!important}
    .hover\\:bg-primary:hover{background-color:${p}!important}
    .hover\\:bg-primary-dark:hover{background-color:${pd}!important}
    .hover\\:bg-primary-light:hover{background-color:${pl}!important}
    .bg-secondary{background-color:${s}!important}
    .hover\\:bg-secondary:hover{background-color:${s}!important}
    /* Text */
    .text-primary{color:${p}!important}
    .text-primary-dark{color:${pd}!important}
    .hover\\:text-primary:hover{color:${p}!important}
    .text-secondary{color:${s}!important}
    /* Border */
    .border-primary{border-color:${p}!important}
    .border-b-2.border-primary{border-bottom-color:${p}!important}
    .border-t-2.border-primary{border-top-color:${p}!important}
    .focus\\:border-primary:focus{border-color:${p}!important}
    /* Accent / ring */
    .accent-primary{accent-color:${p}!important}
    /* Layout */
    .bg-header-bg{background-color:${hb}!important}
    .bg-footer-bg{background-color:${fb}!important}
    .text-footer-text{color:${ft}!important}
    /* Nút hành động */
    .bg-btn-add{background-color:${ba}!important}
    .bg-btn-edit{background-color:${be}!important}
    .bg-btn-delete{background-color:${bd}!important}
    .bg-btn-print{background-color:${bp}!important}
    .bg-btn-view{background-color:${bv}!important}
    .hover\\:bg-btn-add:hover{background-color:${ba}!important}
    .hover\\:bg-btn-edit:hover{background-color:${be}!important}
    .hover\\:bg-btn-delete:hover{background-color:${bd}!important}
    .hover\\:bg-btn-print:hover{background-color:${bp}!important}
    .hover\\:bg-btn-view:hover{background-color:${bv}!important}
    /* Scrollbar */
    ::-webkit-scrollbar-thumb{background:${p}!important}
  `;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const s = localStorage.getItem(THEME_KEY);
      const t = s ? { ...DEFAULT_THEME, ...JSON.parse(s) } : DEFAULT_THEME;
      // Áp dụng ngay trước render đầu tiên — tránh flash màu mặc định
      applyCSSVars(t);
      return t;
    } catch {
      return DEFAULT_THEME;
    }
  });

  // Áp dụng lại mỗi khi theme state thay đổi (sau saveTheme/resetTheme)
  useEffect(() => { applyCSSVars(theme); }, [theme]);

  const saveTheme = useCallback((t) => {
    const merged = { ...DEFAULT_THEME, ...t };
    setTheme(merged);
    localStorage.setItem(THEME_KEY, JSON.stringify(merged));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    localStorage.removeItem(THEME_KEY);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, saveTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme phải dùng trong ThemeProvider');
  return ctx;
};
