import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand-color, #6366f1)',
          foreground: 'var(--brand-foreground, #ffffff)'
        }
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top, rgba(99,102,241,0.25), transparent 60%)'
      }
    }
  },
  plugins: []
};

export default config;
