/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefaf6',
          100: '#d7f3e9',
          200: '#b2e6d5',
          300: '#7ed2ba',
          400: '#47b69b',
          500: '#2b9a81',
          600: '#1e7b68',
          700: '#1b6354',
          800: '#194f44',
          900: '#18423a',
          950: '#0a2622',
        },
      },
    },
  },
  plugins: [],
};
