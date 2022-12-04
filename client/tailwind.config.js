/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    './tailwind-safelist.txt'
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          light: "#00b9ff",
          main: "#1B75BB"
        },
        green: {
          main: "#2ead4b"
        },
        gray: {
          main: "#F1F3F5"
        },
      }
    },
  },
  plugins: [],
}
