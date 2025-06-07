/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
import forms from '@tailwindcss/forms'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        scroll: 'scroll 40s linear infinite',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          'from, to': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  variants: {
    extend: {
      animation: ['hover', 'group-hover'],
    },
  },
  plugins: [
    forms,daisyui,
  ],
  daisyui: {
    themes: ["cupcake"],
  },
}
