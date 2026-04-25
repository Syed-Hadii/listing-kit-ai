/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1437",
          dark: "#070B24",
          gold: "#D4AF37",
          goldLight: "#E8C65A",
          goldDark: "#B8941F",
          cream: "#F8F5EE",
          slate: "#1A2345",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
      },
      boxShadow: {
        luxury: "0 10px 40px -10px rgba(212, 175, 55, 0.15)",
        card: "0 4px 24px -8px rgba(11, 20, 55, 0.08)",
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #E8C65A 50%, #B8941F 100%)',
        'navy-gradient': 'linear-gradient(135deg, #070B24 0%, #0B1437 50%, #1A2345 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
