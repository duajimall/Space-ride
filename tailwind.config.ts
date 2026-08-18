import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0B0E1A',
        panel: '#141830',
        starlight: '#E9E4D6',
        muted: '#8489A8',
        gold: '#F2C879',
        nebula: '#8B7FE8',
        rose: '#E8917A'
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
      keyframes: {
        spin_slow: { to: { transform: 'rotate(360deg)' } },
        drift: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        lidOpen: { from: { transform: 'rotateX(0deg)' }, to: { transform: 'rotateX(-115deg)' } }
      },
      animation: {
        spin_slow: 'spin_slow 2.6s linear infinite',
        drift: 'drift 4s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
export default config
