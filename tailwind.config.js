/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        copart: {
          blue: '#002B49',
          yellow: '#FFB800',
          dark: '#0B132B',
          light: '#F4F6F9',
        }
      }
    },
  },
  plugins: [],
}
