import AuthClient from '@/components/auth/AuthClient';
import Link from 'next/link';
import { ArrowRight, Heart, Route, Ticket } from 'lucide-react';

export const metadata = { title: 'Profile — PujaMate' };

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 pb-4">
      <section><span className="font-body text-[10px] font-bold uppercase tracking-[.18em] text-vermilion">Your space</span><h2 className="font-heading mt-1 text-4xl text-app-text">Profile.</h2><p className="font-body mt-2 text-sm text-app-text/55">Manage your account and keep your PujaMate memories together.</p></section>
      <AuthClient />
      <section className="grid grid-cols-3 gap-2.5">
        <Link href="/routes" className="focus-ring surface-card p-3"><Route size={17} className="text-vermilion" /><span className="font-body mt-2 block text-[11px] font-semibold text-app-text">Routes</span><span className="font-body text-[10px] text-app-text/45">Saved plans</span></Link>
        <Link href="/passport" className="focus-ring surface-card p-3"><Ticket size={17} className="text-marigold" /><span className="font-body mt-2 block text-[11px] font-semibold text-app-text">Passport</span><span className="font-body text-[10px] text-app-text/45">Your badges</span></Link>
        <Link href="/explore" className="focus-ring surface-card p-3"><Heart size={17} className="text-vermilion" /><span className="font-body mt-2 block text-[11px] font-semibold text-app-text">Discover</span><span className="font-body text-[10px] text-app-text/45">Saved pandals</span></Link>
      </section>
      <Link href="/emergency" className="focus-ring flex items-center justify-between rounded-2xl border border-vermilion/15 bg-vermilion/5 px-4 py-3"><span className="font-body text-xs font-semibold text-vermilion">Emergency assistance</span><ArrowRight size={15} className="text-vermilion" /></Link>
    </div>
  );
}
