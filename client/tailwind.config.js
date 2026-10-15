export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090D16',
        surface: '#111827',
        border: '#1F2937',
        brand: {
          50: '#EEF2FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA'
        }
      }
    },
  },
  plugins: [],
}
