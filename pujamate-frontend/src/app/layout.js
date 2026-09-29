// src/app/layout.js
import './globals.css';
import { allFontVariables } from '@/lib/fonts';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import PageTransition from '@/components/motion/PageTransition';
import StoreHydration from '@/store/StoreHydration';
import ThemeProvider from '@/store/ThemeProvider';
import SplashScreen from '@/components/splash/SplashScreen';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import { AudioProvider } from '@/context/AudioContext';

export const metadata = {
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  title: 'PujaMate — Kolkata Durga Puja Companion',
  description:
    'Real-time crowd insights, route planning, food discovery, and a gamified Puja Passport for Kolkata Durga Puja.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#140505',
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: next-themes sets the dark/light class on
    // <html> before React hydrates (to avoid a flash of the wrong theme),
    // which would otherwise trigger a benign server/client mismatch warning
    // on this one element. See https://github.com/pacocoursey/next-themes
    <html lang="en" className={allFontVariables} suppressHydrationWarning>
      <body className="font-body min-h-screen bg-app-bg text-app-text">
        <ThemeProvider>
          <AudioProvider>
          <StoreHydration />
          <SplashScreen />
          <PwaInstallPrompt />
          <Header />
          <main className="mx-auto max-w-2xl px-4 pb-24 pt-5 sm:px-6 sm:pt-6">
            <PageTransition>{children}</PageTransition>
          </main>
          </AudioProvider>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
