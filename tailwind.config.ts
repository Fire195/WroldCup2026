import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts}', './server/**/*.ts'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0f4c81', accent: '#e63946' },
      },
      screens: { xs: '375px' },
    },
  },
} satisfies Config
