/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-canvas': '#FAF8F5',
        card: '#FFFFFF',
        'accent-sage': '#4A7C59',
        'accent-terracotta': '#D97736',
        'text-charcoal': '#2D312E',
        'text-muted': '#6C726D',
        'border-soft': '#EBE7DF',
      },
    },
  },
  plugins: [],
}
