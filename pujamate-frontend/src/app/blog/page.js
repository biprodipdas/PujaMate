'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, PenLine, ArrowRight, ImagePlus, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadCover(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary upload is not configured.');
  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('folder', 'pujamate/blog');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Image upload failed.');
  return data.secure_url;
}

function excerpt(text) { return text.length > 180 ? `${text.slice(0, 180).trim()}…` : text; }

export default function BlogPage() {
  const { user, hydrated } = useAuthStore();
  const [blogs, setBlogs] = useState([]);
  const [pujas, setPujas] = useState([]);
  const [showWrite, setShowWrite] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pujaId, setPujaId] = useState('');
  const [cover, setCover] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.getBlogs(30).then(data => setBlogs(data.blogs || [])).catch(err => setError(err.message));
  useEffect(() => { load(); api.searchPujas({ limit: 500 }).then(data => setPujas(data.pujas || [])).catch(() => {}); }, []);

  async function publish(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return setError('Title and experience are required.');
    if (!user) return setError('Please login before publishing a blog.');
    setBusy(true); setError('');
    try {
      const coverImageUrl = cover ? await uploadCover(cover) : null;
      await api.createBlog({ title, content, pujaId: pujaId || null, coverImageUrl });
      setTitle(''); setContent(''); setPujaId(''); setCover(null); setShowWrite(false);
      await load();
    } catch (err) { setError(err.message || 'Could not publish your blog.'); }
    finally { setBusy(false); }
  }

  return <div className="flex flex-col gap-5 pb-6">
    <section className="rounded-[2rem] bg-gradient-to-br from-crimson via-vermilion to-marigold p-5 text-white shadow-xl sm:p-7">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[.16em]"><BookOpen size={13}/> Puja Blog</span>
      <h1 className="font-heading mt-3 text-4xl leading-none sm:text-5xl">Tell your Puja story.</h1>
      <p className="font-body mt-3 max-w-xl text-sm leading-6 text-white/80">প্যান্ডেল ঘোরা, রাতের শহর, বন্ধুদের সঙ্গে Puja বা ছোট্ট কোনও স্মৃতি—তোমার নিজের experience লিখে share করো।</p>
      <button type="button" onClick={() => { setShowWrite(v => !v); setError(''); }} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-body text-xs font-bold text-crimson shadow-lg"><PenLine size={15}/>{showWrite ? 'Close editor' : 'Write a blog'}</button>
    </section>

    {showWrite && <section className="surface-card p-4 sm:p-5">
      {!hydrated || !user ? <p className="font-body text-sm text-app-text/60">Login to publish your own Puja experience.</p> : <form onSubmit={publish} className="space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} maxLength={180} placeholder="Blog title" className="w-full rounded-2xl border border-app-border/10 bg-app-text/[.03] px-4 py-3 font-subheading text-lg outline-none focus:border-vermilion/40"/>
        <textarea value={content} onChange={e => setContent(e.target.value)} maxLength={12000} placeholder="Write your Puja experience…" className="min-h-56 w-full resize-y rounded-2xl border border-app-border/10 bg-app-text/[.03] px-4 py-3 font-body text-sm leading-6 outline-none focus:border-vermilion/40"/>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={pujaId} onChange={e => setPujaId(e.target.value)} className="w-full rounded-2xl border border-app-border/10 bg-app-surface px-4 py-3 font-body text-sm"><option value="">Tag a pandal (optional)</option>{pujas.map(p => <option key={p.id} value={p.id}>{p.name} — {p.area}</option>)}</select>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-app-border/15 bg-app-text/[.03] px-4 py-3 font-body text-sm text-app-text/60"><ImagePlus size={17}/>{cover ? cover.name : 'Cover image (optional)'}<input type="file" accept="image/*" className="sr-only" onChange={e => setCover(e.target.files?.[0] || null)}/></label>
        </div>
        {error && <p role="alert" className="rounded-2xl bg-vermilion/10 px-3 py-2 font-body text-xs text-vermilion">{error}</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-crimson px-4 py-3 font-body text-sm font-bold text-white disabled:opacity-40"><Send size={16}/>{busy ? 'Publishing…' : 'Publish experience'}</button>
      </form>}
    </section>}

    <section>
      <div className="mb-3"><p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-vermilion">Community stories</p><h2 className="font-subheading mt-1 text-xl">Recent Puja Experiences</h2></div>
      {error && !showWrite && <p className="mb-3 rounded-2xl bg-vermilion/10 px-3 py-2 font-body text-xs text-vermilion">{error}</p>}
      <div className="space-y-3">{blogs.map(blog => <article key={blog.id} className="surface-card overflow-hidden">
        {blog.cover_image_url && <img src={blog.cover_image_url} alt="" className="h-48 w-full object-cover"/>}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><span className="font-body text-[10px] uppercase tracking-[.14em] text-app-text/45">{blog.is_sample ? 'PujaMate sample' : 'Community story'}</span><span className="font-body text-[10px] text-app-text/45">{new Date(blog.created_at).toLocaleDateString('en-IN')}</span></div>
          <h3 className="font-subheading mt-2 text-xl">{blog.title}</h3>
          <p className="font-body mt-2 whitespace-pre-line text-sm leading-6 text-app-text/60">{excerpt(blog.content)}</p>
          <div className="mt-4 flex items-center justify-between gap-3"><span className="font-body text-xs text-app-text/50">By {blog.author_name || 'PujaMate'}</span><Link href={`/blog/${blog.id}`} className="inline-flex items-center gap-1 font-body text-xs font-bold text-vermilion">Read more <ArrowRight size={14}/></Link></div>
        </div>
      </article>)}</div>
    </section>
  </div>;
}
