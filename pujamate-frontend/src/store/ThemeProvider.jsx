'use client';

// src/store/ThemeProvider.jsx
// Wraps next-themes. Dark is the app's default theme (per design spec),
// so defaultTheme="dark" and enableSystem is off — we want a deliberate
// two-state toggle (dark/light), not a third "match my OS" state that
// would make the default ambiguous. attribute="class" toggles a `dark`
// or `light` class on <html>, which tailwind.config.js's darkMode:'class'
// and globals.css's `.dark` / `.light` selectors both key off.

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light']}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
