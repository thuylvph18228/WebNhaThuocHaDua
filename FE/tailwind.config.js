/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00a651',
          dark: '#007a3d',
          light: '#e8f5ee',
        },
        secondary: '#f26522',
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

