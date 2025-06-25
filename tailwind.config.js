/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"], // or where your files are.
  theme: {
    extend: {
      fontFamily: {
        "abhaya-libre": ["Abhaya Libre", "serif"], // Add your font here
      },
    },
  },
  plugins: [],
};
