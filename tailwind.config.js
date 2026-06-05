/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ["./**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        tight: ['"Inter Tight"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: '#04070a',
        surface: '#0a1411',
        line: '#16352a',
        neon: '#2bff88',
        lime: { ...colors.lime, DEFAULT: '#c6ff3d' },
      },
    },
  },
  plugins: [],
}
