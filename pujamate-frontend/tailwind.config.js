/** @type {import('tailwindcss').Config} */
module.exports = {
  // 'class' strategy driven by next-themes (see src/store/ThemeProvider.jsx),
  // which toggles a `dark` class on <html>. Dark is the app's default theme
  // (see globals.css :root values) — `dark:` variants below are overrides
  // applied on TOP of that default, same as Tailwind's normal convention.
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core festival palette (PRD section 3) — intentionally constant
        // across light/dark themes, since these carry semantic meaning
        // (crowd status, category badges, primary CTAs) rather than being
        // page chrome. See README "Dark/Light mode" section for the
        // reasoning behind what does vs. doesn't change with the theme.
        vermilion: {
          DEFAULT: '#E32636',
          50: '#FDECEE',
          100: '#FAD5D8',
          400: '#EA5563',
          600: '#C41E2C',
          700: '#9E1622',
        },
        marigold: {
          DEFAULT: '#FFC000',
          50: '#FFF8E1',
          100: '#FFEDB3',
          400: '#FFCF33',
          600: '#D9A200',
        },
        crimson: {
          DEFAULT: '#900C3F',
          50: '#F7E9EE',
          100: '#E3C2CF',
          600: '#70092F',
          700: '#5C0726',
          900: '#4A0620',
        },
        // Theme-aware "app chrome" tokens — page background, surfaces,
        // and primary text. These DO flip between light/dark (see the
        // CSS variables in globals.css). Used by Header, MobileNav,
        // SplashScreen, and any new theme-aware surface.
        //
        // rgb(var(...) / <alpha-value>) — not a plain var() — is required
        // for Tailwind's opacity modifiers (e.g. bg-app-surface/90) to work;
        // the CSS variables themselves are unitless "R G B" triplets.
        app: {
          bg: 'rgb(var(--app-bg) / <alpha-value>)',
          surface: 'rgb(var(--app-surface) / <alpha-value>)',
          text: 'rgb(var(--app-text) / <alpha-value>)',
          border: 'rgb(var(--app-border) / <alpha-value>)',
          gold: 'rgb(var(--app-gold) / <alpha-value>)',
          accent: 'rgb(var(--app-accent) / <alpha-value>)',
        },
      },
      fontFamily: {
        // Approach A — Classical & Royal
        'heading-a': ['var(--font-heading-a)', 'serif'],
        'subheading-a': ['var(--font-subheading-a)', 'serif'],
        'body-a': ['var(--font-body-a)', 'sans-serif'],
        // Approach B — Bold & Festive (default, see src/lib/fonts.js)
        'heading-b': ['var(--font-heading-b)', 'serif'],
        'subheading-b': ['var(--font-subheading-b)', 'sans-serif'],
        'body-b': ['var(--font-body-b)', 'sans-serif'],
      },
      boxShadow: {
        'sheet': '0 -8px 30px rgba(74, 6, 32, 0.18)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '70%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        // Diya flame flicker (SplashScreen) — organic wobble, not a clean pulse
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scaleY(1) scaleX(1)' },
          '25%': { opacity: '0.82', transform: 'scaleY(1.1) scaleX(0.93)' },
          '50%': { opacity: '0.95', transform: 'scaleY(0.9) scaleX(1.06)' },
          '75%': { opacity: '0.88', transform: 'scaleY(1.05) scaleX(0.96)' },
        },
        // Ambient aura glow pulse behind the Durga face (SplashScreen)
        'aura-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.15)' },
        },
        // Diya orbit ring (SplashScreen): the ring itself spins one way,
        // each diya spins the opposite way at the same speed so it stays
        // visually upright while its position still travels around the ring.
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'orbit-reverse': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        flicker: 'flicker 1.4s ease-in-out infinite',
        'aura-pulse': 'aura-pulse 3.5s ease-in-out infinite',
        'orbit-slow': 'orbit 22s linear infinite',
        'orbit-slow-reverse': 'orbit-reverse 22s linear infinite',
      },
      borderRadius: {
        'sheet': '1.75rem',
      },
    },
  },
  plugins: [],
};
