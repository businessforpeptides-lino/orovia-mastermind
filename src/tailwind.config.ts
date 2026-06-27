import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#141414',
        charcoal: {
          DEFAULT: '#141414',
          2: '#1c1c1c',
          3: '#0e0e0e',
          deep: '#0c0c0c',
        },
        gold: {
          DEFAULT: '#D4AF37',
          bright: '#f0d068',
          cream: '#e8c558',
          deep: '#8a7124',
          shadow: '#3d3110',
          muted: '#9A9080',
        },
        cream: '#f5e9c8',
        white2: '#f4ede0',
        red: {
          DEFAULT: '#ff0a0a',
          bright: '#ff2828',
        },
        body: 'rgba(244,237,224,0.6)',

        // Legacy keys
        'bg-warm': '#1c1c1c',
        wordmark: '#1F1A14',
        silver: { 1: '#2A2A2D', 2: '#6E6E72', 3: '#8C8C8C' },
        'shadow-warm': '#2A2520',
      },
      fontFamily: {
        display: ['var(--font-inter-tight)', 'Inter Tight', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter-tight)', 'Inter Tight', 'system-ui', 'sans-serif'],
        script: ['var(--font-inter-tight)', 'Inter Tight', 'system-ui', 'sans-serif'],
        wordmark: ['var(--font-wordmark)', 'Impact', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
