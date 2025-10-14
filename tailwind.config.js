/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e9e9ff',
          100: '#c5c5ff',
          200: '#a0a0ff',
          300: '#7b7bff',
          400: '#5656ff',
          500: '#3131ff',
          600: '#1a1adb',
          700: '#1010aa',
          800: '#090979',
          900: '#020084',
        },
      },
    },
  },
  plugins: [],
};
