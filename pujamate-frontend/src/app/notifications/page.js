'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, BellRing, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function NotificationsPage() {
  const { user, hydrated } = useAuthStore();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function enable() {
    setLoading(true);
    setMessage('');
    try {
      if (!hydrated || !user) throw new Error('Sign in before enabling PujaMate notifications.');
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported in this browser.');
      }

      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error('Push notifications are not configured yet. Add NEXT_PUBLIC_VAPID_PUBLIC_KEY to the frontend environment.');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Notification permission was not granted.');

      const registration = await navigator.serviceWorker.register('/sw.js');
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        });
      }

      await api.subscribeNotifications(subscription.toJSON());
      setEnabled(true);
      setMessage('Notifications are enabled.');
    } catch (error) {
      setMessage(error.message || 'Could not enable notifications.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-crimson to-vermilion p-6 text-white shadow-xl shadow-crimson/15">
        <BellRing size={24} className="text-marigold" />
        <h1 className="font-heading mt-2 text-4xl">Push Notifications</h1>
        <p className="font-body mt-3 text-sm leading-6 text-white/70">Get useful PujaMate alerts such as crowd updates for pandals you care about.</p>
      </section>

      <section className="surface-card p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-marigold/15 text-crimson"><Bell size={27} /></div>
        <h2 className="font-subheading mt-4 text-base text-app-text">Stay updated while you explore</h2>
        <p className="font-body mx-auto mt-2 max-w-sm text-sm leading-6 text-app-text/50">Enable browser push and PujaMate can notify you when a subscribed Puja gets a fresh crowd report.</p>

        {!hydrated ? (
          <p className="mt-5 text-xs text-app-text/45">Checking your account…</p>
        ) : !user ? (
          <Link href="/auth" className="mt-5 inline-flex rounded-xl bg-vermilion px-5 py-3 text-sm font-bold text-white">Sign in to enable</Link>
        ) : (
          <button onClick={enable} disabled={loading || enabled} className="focus-ring mt-5 rounded-xl bg-vermilion px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
            {enabled ? 'Notifications Enabled' : loading ? 'Enabling…' : 'Enable Notifications'}
          </button>
        )}

        {message && <p className="mt-3 flex items-center justify-center gap-1 text-xs text-app-text/55">{enabled && <CheckCircle2 size={13} className="text-emerald-600" />}{message}</p>}
      </section>

      <Link href="/explore" className="text-center text-xs font-semibold text-vermilion">Choose a Puja to subscribe →</Link>
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}
