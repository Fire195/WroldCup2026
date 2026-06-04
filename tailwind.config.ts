import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts}', './server/**/*.ts'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 2026 FIFA World Cup Official Colors
        wc: {
          green: '#3CAC3B',    // American Green - primary action
          blue: '#2A398D',      // Dark Blue - headers/cards
          red: '#E61D25',       // Red - live/alert
          gold: '#D4AF37',      // Trophy gold
          gray: '#474A4A',      // Dark gray
          'gray-light': '#D1D4D1',
        },
        // Legacy brand kept for compatibility
        brand: { DEFAULT: '#3CAC3B', accent: '#E61D25' },
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Oswald"', 'Impact', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        widest: '0.15em',
      },
      animation: {
        'score-flip': 'scoreFlip 0.6s cubic-bezier(0.45, 0, 0.55, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scoreFlip: {
          '0%': { transform: 'rotateX(0deg)', opacity: '1' },
          '49%': { transform: 'rotateX(90deg)', opacity: '0' },
          '50%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.05)', opacity: '0.5' },
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0 0 rgba(0, 0, 0, 1)',
        'brutal-lg': '8px 8px 0 0 rgba(0, 0, 0, 1)',
        'stadium': '0 20px 60px -10px rgba(42, 57, 141, 0.3)',
      },
      screens: { xs: '375px' },
    },
  },
} satisfies Config
