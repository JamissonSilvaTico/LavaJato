/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#007aff',
        'brand-blue-light': '#e6f2ff',
        'brand-dark': '#1a202c',
        'brand-secondary': '#4a5568',
        'brand-light': '#f7fafc',
      },
    },
  },
  plugins: [],
}