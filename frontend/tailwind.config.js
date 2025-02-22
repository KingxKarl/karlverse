// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your Custom HiredSoon Color Scheme
        primary: {
          DEFAULT: "#4FD1C5", // Main Brand Color
          light: "#6FE3D9",
          dark: "#3BB5AA"
        },
        secondary: {
          DEFAULT: "#2D3748", // Text and Backgrounds
          light: "#4A5568",
          dark: "#1A202C"
        },
        accent: {
          DEFAULT: "#F6AD55", // Buttons and Highlights
          light: "#FBD38D",
          dark: "#DD6B20"
        },
        background: "#EDF2F7", // Page Background
        text: "#1A202C", // Main Text Color
      }
    }
  },
  plugins: [],
};
