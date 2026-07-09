/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#d9e2ec",
        background: "#f6f8fb",
        foreground: "#17202a",
        muted: "#52606d",
        primary: {
          DEFAULT: "#0f6ea8",
          foreground: "#ffffff"
        }
      }
    }
  },
  plugins: []
};
