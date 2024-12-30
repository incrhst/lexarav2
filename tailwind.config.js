/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#484949',
          light: '#525252',
          lighter: '#636363',
        },
        background: {
          DEFAULT: '#EDEAE4',
          alt: '#EDEBE6',
        },
      },
    },
  },
  plugins: [],
};