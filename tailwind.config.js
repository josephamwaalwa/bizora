/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F3F9',
          100: '#E2E7F2',
          200: '#C5D0E5',
          300: '#9DB1D3',
          400: '#6E8CB9',
          500: '#486BA0',
          600: '#2E4B77',
          700: '#1F3455',
          800: '#16233B',
          900: '#101828',
          950: '#0A0F1A',
        },
        indigo: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F9F8F',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px -1px rgba(16, 24, 40, 0.05)',
        'card': '0 2px 6px -1px rgba(16, 24, 40, 0.06), 0 1px 4px -1px rgba(16, 24, 40, 0.04)',
        'elevated': '0 10px 25px -5px rgba(16, 24, 40, 0.08), 0 8px 10px -6px rgba(16, 24, 40, 0.04)',
        'modal': '0 25px 50px -12px rgba(16, 24, 40, 0.25)',
      }
    },
  },
  plugins: [],
}
