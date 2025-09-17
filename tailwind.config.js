/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gold': '#FFD700',
        'ring-yellow': '#FFEB3B',
        'ring-red': '#F44336',
        'ring-blue': '#2196F3',
        'ring-black': '#212121',
        'ring-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}