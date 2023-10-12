/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  daisyui: {
    themes: ["light", "dark", "pastel"],
  },
  plugins: [],
  purge: ['./**/*.html'],
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
}