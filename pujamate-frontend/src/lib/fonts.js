// PujaMate font configuration
//
// The previous implementation used next/font/google for six Google fonts.
// That makes `next build` depend on Google Fonts metadata being reachable and
// parseable during the build. In some environments Next 14.2.4 can fail in
// the Google font loader before webpack compilation starts.
//
// The active typography is already defined in globals.css with CSS fallbacks
// and a Google Fonts @import. Keeping the typography there makes production
// builds independent of next/font's build-time network/parser step.

// Kept as a simple export because app/layout.js applies this value to <html>.
// No generated next/font class names are required by the current CSS.
export const allFontVariables = '';

// Theme selector retained for compatibility with the existing typography
// architecture. The active design uses the "B" (festive) typography system.
export const THEME_APPROACH = 'B';
