/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Màu đọc từ CSS variables — thay đổi được từ trang /admin/giao-dien
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        secondary: 'var(--color-secondary)',
        'header-bg': 'var(--color-header-bg)',
        'footer-bg': 'var(--color-footer-bg)',
        'footer-text': 'var(--color-footer-text)',
        'btn-add': 'var(--color-btn-add)',
        'btn-edit': 'var(--color-btn-edit)',
        'btn-delete': 'var(--color-btn-delete)',
        'btn-print': 'var(--color-btn-print)',
        'btn-view': 'var(--color-btn-view)',
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
      keyframes: {
        scan: {
          '0%, 100%': { top: '8px' },
          '50%': { top: 'calc(100% - 10px)' },
        },
      },
      animation: {
        scan: 'scan 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

