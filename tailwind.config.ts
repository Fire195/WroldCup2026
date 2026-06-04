import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts}', './server/**/*.ts'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 2026 FIFA World Cup - Refined Palette
        'wc-green': '#3CAC3B',
        'wc-blue': '#2A398D',
        'wc-red': '#E61D25',
        'wc-gold': '#D4AF37',
        'wc-gray': '#474A4A',
        'wc-gray-light': '#D1D4D1',
        // Softer neutrals for refined aesthetic
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          800: '#292524',
          900: '#1C1917',
        },
        brand: { DEFAULT: '#3CAC3B', accent: '#E61D25' },
      },
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', '0.875rem'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 600ms ease-out',
        'slide-up': 'slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 8px 40px rgba(0, 0, 0, 0.1)',
      },
      screens: { xs: '375px' },
    },
  },
} satisfies Config
