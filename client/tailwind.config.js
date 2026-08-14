/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-teal': '#0F6E56',
        'deep-blue': '#1E5B8C',
        'soft-mint': '#E1F5EE',
        'warm-coral': '#D85A30',
        'neutral-gray': '#5F5E5A',
        'off-white': '#F7F9F8',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
