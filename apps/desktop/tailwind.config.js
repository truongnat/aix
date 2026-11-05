/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/**/*.{html,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#08090d',
        surface: '#0e1017',
        'surface-elevated': '#141720',
        border: 'rgba(255, 255, 255, 0.05)',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
      },
    },
  },
  plugins: [],
};
