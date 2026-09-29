'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Compass, Route, Ticket, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/explore', label: 'Discover', icon: Compass },
  { href: '/route-planner', label: 'Routes', icon: Route },
  { href: '/passport', label: 'Passport', icon: Ticket },
  { href: '/metro', label: 'Metro', icon: Route },
  { href: '/community', label: 'Moments', icon: Camera },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-app-border/10 bg-app-surface/90 shadow-[0_-10px_30px_rgba(60,8,20,.08)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-stretch justify-between px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link key={href} href={href} className="focus-ring flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5" aria-current={active ? 'page' : undefined}>
              <span className={`flex h-8 w-10 items-center justify-center rounded-xl ${active ? 'bg-vermilion text-white shadow-md shadow-vermilion/20' : 'text-app-text/55'}`}>
                <Icon size={19} strokeWidth={active ? 2.25 : 1.8} />
              </span>
              <span className={`font-body text-[10px] leading-none ${active ? 'font-semibold text-vermilion' : 'text-app-text/55'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
