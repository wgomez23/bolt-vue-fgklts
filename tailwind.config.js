/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F7931A',
          light: '#ffa533',
          dark: '#d97b06'
        },
        secondary: {
          DEFAULT: '#00FF94',
          light: '#33ffa8',
          dark: '#00cc77'
        },
        dark: {
          DEFAULT: '#111111',
          lighter: '#1a1a1a',
          card: '#222222'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
      },
    },
  },
  plugins: [],
}