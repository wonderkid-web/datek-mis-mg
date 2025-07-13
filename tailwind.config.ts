import type { Config } from "tailwindcss";

const config = {
  darkMode: "class", // Or "media" or false
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: "#00612c", // Your primary color
        // You can define other colors here if needed
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
