import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': 'var(--bg-main)',
        'bg-card': 'var(--bg-card)',
        'bg-soft': 'var(--bg-soft)',
        'bg-glass': 'var(--bg-glass)',
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-dark': 'var(--brand-primary-dark)',
        'brand-primary-soft': 'var(--brand-primary-soft)',
        'brand-primary-softer': 'var(--brand-primary-softer)',
      },
      fontFamily: {
        sans: 'var(--font-geist-sans)',
        mono: 'var(--font-geist-mono)',
      },
    },
  },
  plugins: [],
};

export default config;
