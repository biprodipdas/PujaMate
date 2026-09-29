'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Loader2, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthClient() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const hydrate = useAuthStore((state) => state.hydrate);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => { hydrate(); }, [hydrate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      setMessage(mode === 'login' ? 'You are signed in.' : 'Account created and signed in.');
    } catch {
      // The store exposes the API error below the form.
    }
  }

  if (user) {
    return (
      <section className="surface-card overflow-hidden">
        <div className="bg-gradient-to-br from-crimson to-vermilion p-6 text-white">
          <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-marigold"><UserRound size={27} /></span><div><p className="font-body text-[10px] font-bold uppercase tracking-[.18em] text-white/60">PujaMate member</p><h2 className="font-heading text-2xl">Welcome, {user.name}</h2></div></div>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-app-text/[.04] p-3"><Mail size={16} className="text-vermilion" /><span className="font-body text-sm text-app-text/70">{user.email}</span></div>
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-3"><ShieldCheck size={17} className="text-emerald-600 dark:text-emerald-400" /><span className="font-body text-xs text-app-text/65">Your saved routes, passport and crowd reports stay linked to this account.</span></div>
          <button type="button" onClick={logout} className="focus-ring flex items-center justify-center gap-2 rounded-2xl border border-app-border/10 py-3 font-body text-sm font-semibold text-app-text hover:bg-app-text/5"><LogOut size={16} /> Sign out</button>
        </div>
      </section>
    );
  }

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="mb-5"><p className="font-body text-[10px] font-bold uppercase tracking-[.18em] text-vermilion">Member access</p><h2 className="font-heading mt-1 text-3xl text-app-text">{mode === 'login' ? 'Welcome back.' : 'Join PujaMate.'}</h2><p className="font-body mt-2 text-sm leading-6 text-app-text/55">{mode === 'login' ? 'Continue your PujaMate journey.' : 'Save routes, report crowds and collect your Puja Passport.'}</p></div>
      <div className="mb-5 grid grid-cols-2 rounded-2xl bg-app-text/[.04] p-1">{['login', 'register'].map((option) => <button key={option} type="button" onClick={() => setMode(option)} className={`focus-ring rounded-xl py-2.5 font-body text-xs font-bold ${mode === option ? 'bg-app-surface text-vermilion shadow-sm' : 'text-app-text/45'}`}>{option === 'login' ? 'Sign in' : 'Register'}</button>)}</div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'register' && <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" className="focus-ring rounded-2xl border border-app-border/10 bg-app-text/[.025] px-4 py-3 font-body text-sm text-app-text outline-none placeholder:text-app-text/35" />}
        <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" className="focus-ring rounded-2xl border border-app-border/10 bg-app-text/[.025] px-4 py-3 font-body text-sm text-app-text outline-none placeholder:text-app-text/35" />
        <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password · 8+ characters" className="focus-ring rounded-2xl border border-app-border/10 bg-app-text/[.025] px-4 py-3 font-body text-sm text-app-text outline-none placeholder:text-app-text/35" />
        <button type="submit" disabled={loading} className="focus-ring mt-1 flex items-center justify-center gap-2 rounded-2xl bg-vermilion py-3.5 font-body text-sm font-bold text-white shadow-lg shadow-vermilion/15 disabled:opacity-60">{loading && <Loader2 size={16} className="animate-spin" />}{mode === 'login' ? 'Sign in' : 'Create account'} {!loading && <ArrowRight size={15} />}</button>
      </form>
      {(error || message) && <p role={error ? 'alert' : 'status'} className={`font-body mt-3 rounded-xl px-3 py-2 text-xs ${error ? 'bg-vermilion-50 text-vermilion-700 dark:bg-vermilion/10 dark:text-vermilion-400' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}`}>{error || message}</p>}
    </section>
  );
}
