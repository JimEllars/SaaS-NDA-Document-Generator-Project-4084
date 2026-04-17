/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'axim-teal': '#00E5FF',
        'void': '#000000',
      }
    }
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}
