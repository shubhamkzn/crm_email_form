/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '.darkCustom'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Plugin to add !important to dark mode utilities
    function({ addUtilities, theme, variants }) {
      const darkUtilities = {
        '.dark-important': {
          '&.bg-slate-900': {
            'background-color': `${theme('colors.slate.900')} !important`,
          },
          '&.text-white': {
            'color': `${theme('colors.white')} !important`,
          },
          '&.border-slate-800': {
            'border-color': `${theme('colors.slate.800')} !important`,
          },
        }
      }
      
      addUtilities(darkUtilities, variants('backgroundColor'))
    }
  ],
  // Increase specificity to override Bootstrap
  important: true, // This adds !important to all Tailwind utilities
}