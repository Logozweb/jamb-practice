/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jamb: {
          dark: '#004d25',
          green: '#006633',
          lightGreen: '#008744',
          accent: '#00A859',
          gold: '#FFB800',
          yellow: '#FFF9E6',
          paleGreen: '#E6F4EA',
          border: '#D0D7DE',
          text: '#1F2937',
          muted: '#6B7280',
          bg: '#F3F4F6'
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['"Consolas"', '"Courier New"', 'monospace']
      }
    },
  },
  plugins: [],
}
