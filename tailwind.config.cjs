/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,js,jsx,css,scss}', './components/**/*.{ts,tsx,js,jsx,css,scss}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // your gym blue
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
