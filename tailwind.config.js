/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fb: {
          dark: '#0b0f19',
          card: '#121826',
          border: '#1f293d',
          accent: '#10b981',
          accentHover: '#059669',
          gold: '#f59e0b',
          blue: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
