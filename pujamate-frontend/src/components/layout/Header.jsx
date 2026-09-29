'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Bell, MapPinned, Route, UserRound, Volume2, VolumeX } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAudio } from '@/context/AudioContext';

export default function Header({ locationLabel = 'Kolkata' }) {
  const { isPlaying, toggleAudio } = useAudio();

  return (
    <header className="sticky top-0 z-40 border-b border-app-border/10 bg-app-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="focus-ring group flex items-center gap-2.5 rounded-2xl">
         <span className="relative flex h-10 w-10 overflow-hidden rounded-2xl shadow-lg shadow-vermilion/20">
            <Image
              src="/images/logo.png"
              alt="Durga Ma"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </span>
          <span>
            <span className="font-heading block text-[1.65rem] leading-none text-festive-gradient">PujaMate</span>
            <span className="font-body mt-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[.16em] text-app-text/55">
              <MapPinned size={10} /> {locationLabel} · Durga Puja
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {/* Audio Control Button */}
          <button
            type="button"
            onClick={toggleAudio}
            aria-label={isPlaying ? 'Mute Background Audio' : 'Play Background Audio'}
            className="focus-ring relative rounded-full p-2.5 text-app-text/75 hover:bg-app-text/5 transition-colors"
          >
            {isPlaying ? (
              <Volume2 size={18} className="text-vermilion animate-pulse" />
            ) : (
              <VolumeX size={18} className="text-app-text/50" />
            )}
          </button>

          <Link href="/emergency" aria-label="Emergency assistance" className="focus-ring rounded-full p-2.5 text-vermilion hover:bg-vermilion-50 dark:hover:bg-vermilion/10">
            <AlertTriangle size={18} strokeWidth={2} />
          </Link>

          <button type="button" aria-label="Notifications" className="focus-ring hidden rounded-full p-2.5 text-app-text/75 hover:bg-app-text/5 sm:block">
            <Bell size={18} />
          </button>
  
          <ThemeToggle />
        </div>
      </div>
      <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
        <Link href="/metro" className="shrink-0 rounded-full bg-app-text/[.05] px-3 py-1.5 font-body text-[10px] font-bold text-app-text/65 hover:bg-vermilion/10 hover:text-vermilion">🚇 Metro</Link>
        <Link href="/bus" className="shrink-0 rounded-full bg-app-text/[.05] px-3 py-1.5 font-body text-[10px] font-bold text-app-text/65 hover:bg-vermilion/10 hover:text-vermilion">🚌 Bus</Link>
        <Link href="/blog" className="shrink-0 rounded-full bg-app-text/[.05] px-3 py-1.5 font-body text-[10px] font-bold text-app-text/65 hover:bg-vermilion/10 hover:text-vermilion">📝 Puja Blog</Link>
        <Link href="/route-planner" className="shrink-0 rounded-full bg-app-text/[.05] px-3 py-1.5 font-body text-[10px] font-bold text-app-text/65 hover:bg-vermilion/10 hover:text-vermilion">🧭 Planner</Link>
      </div>
    </header>
  );
}