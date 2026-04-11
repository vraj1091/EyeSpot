/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0f172a",
        primary: "#0d4ed8",
        accent: "#f97316",
        light: "#f8fafc"
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Public Sans', 'sans-serif']
      },
      boxShadow: {
        card: '0 20px 45px -30px rgba(15, 23, 42, 0.45)'
      }
    },
  },
  plugins: [],
}
