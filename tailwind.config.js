/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
// In your tailwind.config.js file
module.exports = {
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {};

      for (let i = 1; i <= 100; i++) {
        newUtilities[`.lg:w-${i}0%`] = {
          width: `${i * 10}%`,
        };
      }

      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
