/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a60a8",
          dark: "#06265a",
          light: "#edf4ff",
        },
        accent: {
          DEFAULT: "#d9a33a",
          light: "#f5d170",
          dark: "#845f20",
        },
      },
    },
  },
  plugins: [],
};
