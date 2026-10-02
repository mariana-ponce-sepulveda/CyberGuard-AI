import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Fondos ──────────────────────────────────────────────
        'bg-base':     '#080d1a',   // Fondo de página
        'bg-surface':  '#0d1526',   // Tarjetas y paneles
        'bg-elevated': '#121d35',   // Superficies elevadas, inputs
        'bg-muted':    '#1a2640',   // Bordes, divisores

        // ── Acentos ─────────────────────────────────────────────
        'accent-primary':   '#00d4ff',
        'accent-secondary': '#3b82f6',

        // ── Riesgo ──────────────────────────────────────────────
        'risk-low':        '#22c55e',
        'risk-low-bg':     'rgba(34,197,94,0.10)',
        'risk-medium':     '#f59e0b',
        'risk-medium-bg':  'rgba(245,158,11,0.10)',
        'risk-high':       '#ef4444',
        'risk-high-bg':    'rgba(239,68,68,0.10)',

        // ── Texto ───────────────────────────────────────────────
        'text-primary':   '#f0f4ff',
        'text-secondary': '#8892a4',
        'text-muted':     '#4a5568',
        'text-accent':    '#00d4ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #00d4ff, #3b82f6)',
      },
      boxShadow: {
        'glow-cyan':  '0 0 20px rgba(0,212,255,0.25)',
        'glow-sm':    '0 0 10px rgba(0,212,255,0.15)',
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0,212,255,0.25)' },
          '50%':       { opacity: '0.7', boxShadow: '0 0 40px rgba(0,212,255,0.50)' },
        },
        'scan': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan':       'scan 2s linear infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
