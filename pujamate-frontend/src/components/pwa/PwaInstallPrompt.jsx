'use client';

import { useEffect, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});

    const installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (installed) return;

    const ua = window.navigator.userAgent || '';
    const isAppleMobile = /iPhone|iPad|iPod/i.test(ua);
    if (isAppleMobile) setShowManual(true);

    const handler = event => { event.preventDefault(); setPromptEvent(event); };
    const installedHandler = () => { setPromptEvent(null); setShowManual(false); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  if (dismissed || (!promptEvent && !showManual)) return null;

  const install = async () => {
    if (!promptEvent) {
      setShowManual(true);
      return;
    }
    const event = promptEvent;
    await event.prompt();
    setPromptEvent(null);
  };

  return <div className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-2xl rounded-3xl border border-app-border/10 bg-app-surface p-3 shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[380px]">
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-vermilion text-white"><Download size={20}/></span>
      <div className="min-w-0 flex-1"><p className="font-subheading text-sm">Install PujaMate</p><p className="font-body text-[11px] leading-4 text-app-text/55">Add PujaMate to your home screen for a faster app-like experience.</p></div>
      <button type="button" onClick={()=>setDismissed(true)} aria-label="Dismiss" className="rounded-full p-2 text-app-text/40"><X size={15}/></button>
    </div>
    {showManual ? <div className="mt-3 rounded-2xl bg-app-text/5 p-3 font-body text-xs leading-5 text-app-text/60"><b>Android/Chrome:</b> open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.<br/><b>iPhone/iPad:</b> tap <Share2 size={12} className="inline"/> Share → <b>Add to Home Screen</b>.</div> : <button type="button" onClick={install} className="mt-3 w-full rounded-2xl bg-crimson px-4 py-2.5 font-body text-xs font-bold text-white">Install App</button>}
  </div>;
}
