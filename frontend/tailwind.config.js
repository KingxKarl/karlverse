/** @type {import('tailwindcss').Config} */
export default {
  // We continue using the "class" strategy—but now the default styles are dark.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Use feng shui colors for career and success:
        primary: "#D4AF37",   // Rich gold for accents, buttons, links, etc.
        secondary: "#0D3B66", // Deep blue for secondary elements if needed
        background: "#0A0F1E",// Deep dark blue/black for the overall background
        text: "#FFFFFF",      // White text for contrast
        card: "#1C1C1C",      // Dark neutral for panels and cards
      },
    },
  },
  plugins: [],
};
