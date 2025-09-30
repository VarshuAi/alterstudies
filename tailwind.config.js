/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0EA5E9",
        ink: "#0F172A",
        bg: "#F8FAFC"
      }
    }
  },
  plugins: []
}
