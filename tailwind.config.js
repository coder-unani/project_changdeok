const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/views/**/*.ejs', './src/styles/**/*.css'],
  theme: {
    extend: {
      colors: colors,
      fontFamily: {
        sans: ['var(--default-font-family)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
