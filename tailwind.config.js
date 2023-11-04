/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.ejs`],
  daisyui: {
    themes: ["light", "dark", "pastel"],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
}