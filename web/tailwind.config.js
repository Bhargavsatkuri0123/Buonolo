/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./App.tsx", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F4C430",
        primaryLight: "#FFF8E1",
      },
    },
  },
  plugins: [],
};
