/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: { max: "425px" },
      },
      fontFamily: {
        sans: ["'Noto Sans'", "ui-sans-serif", "system-ui"], // Noto Sans를 기본 sans-serif로 설정
      },
    },
  },
  plugins: [],
};
