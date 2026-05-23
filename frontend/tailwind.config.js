/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        inferra: {
          ink: "#020617",
          surface: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};
