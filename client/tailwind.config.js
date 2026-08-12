/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        adani: {
          blue: '#005691',
          teal: '#0072CE',
          sky: '#00A3E0',
          purple: '#5C2D91',
          violet: '#7B2CBF',
          coral: '#F05A28',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0072CE',
          600: '#005691',
          700: '#003e6b',
          900: '#002542',
        },
        status: {
          critical: '#DC2626',
          warning: '#D97706',
          healthy: '#059669',
        },
      },
    },
  },
  plugins: [],
};
