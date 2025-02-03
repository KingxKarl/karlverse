/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enables dark mode switching
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0077b6",  // Blue 
        backgroundDark: "#0a0f1e",  // Deep Navy
        backgroundLight: "#ffffff", // White
        textDark: "#e0e0e0",  // Light Gray
        textLight: "#333333",  // Dark Gray
        highlight: "#c0c0c0",  // Silver
        secondary: "#4b4b4b",  // Dark Gray
      },
    },
  },
  plugins: [],
};
