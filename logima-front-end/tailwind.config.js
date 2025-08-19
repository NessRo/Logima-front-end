// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand:  '#6d5efc', // indigo
        accent: '#2ee6c5', // teal
        ink:    '#e9f1ff',
        panel:  '#11131e',
        bg:     '#0b0c14',
      },
    },
  },
  plugins: [],
}