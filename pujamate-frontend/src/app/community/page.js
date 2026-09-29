'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, Download, ImagePlus, MapPin, Send, Sparkles, X } from 'lucide-react';
import { api } from '@/lib/api';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Community photo upload is not configured yet. Add Cloudinary cloud name and upload preset to .env.local.');
  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('folder', 'pujamate/community');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Image upload failed.');
  return data.secure_url;
}

function downloadUrl(url) {
  return url.replace('/upload/', '/upload/fl_attachment/');
}

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [pujaId, setPujaId] = useState('');
  const [pujas, setPujas] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.getCommunityPosts(30).then(data => setPosts(data.posts || [])).catch(err => setError(err.message));
  useEffect(() => { load(); api.searchPujas({ limit: 500 }).then(data => setPujas(data.pujas || [])).catch(() => {}); }, []);

  const selectFile = (event) => {
    const next = event.target.files?.[0];
    if (!next) return;
    if (!next.type.startsWith('image/')) return setError('Please choose an image file.');
    if (next.size > 8 * 1024 * 1024) return setError('Please keep the image under 8 MB.');
    setError(''); setFile(next); setPreview(URL.createObjectURL(next));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) return setError('Choose a Puja photo first.');
    setBusy(true); setError('');
    try {
      const imageUrl = await uploadToCloudinary(file);
      await api.createCommunityPost({ imageUrl, caption, pujaId: pujaId || null });
      setFile(null); setPreview(''); setCaption(''); setPujaId('');
      await load();
    } catch (err) { setError(err.message || 'Could not publish photo.'); }
    finally { setBusy(false); }
  };

  return <div className="flex flex-col gap-5 pb-6">
    <section className="rounded-[2rem] bg-gradient-to-br from-crimson via-vermilion to-marigold p-5 text-white shadow-xl sm:p-7">
      <span className="font-body inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em]"><Camera size={13}/> Puja Moments</span>
      <h1 className="font-heading mt-3 text-4xl leading-none sm:text-5xl">Share the Puja.</h1>
      <p className="font-body mt-3 max-w-xl text-sm leading-6 text-white/80">তোমার তোলা Durga Puja-এর ছবি post করো। অন্যরা দেখতে পারবে এবং original image download করতে পারবে।</p>
    </section>

    <section className="surface-card p-4 sm:p-5">
      <form onSubmit={submit} className="space-y-3">
        <label className="group relative block cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-app-border/15 bg-app-text/[.025]">
          {preview ? <><img src={preview} alt="Selected Puja preview" className="h-64 w-full object-cover"/><button type="button" onClick={(e) => { e.preventDefault(); setFile(null); setPreview(''); }} className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white"><X size={16}/></button></> : <span className="flex min-h-44 flex-col items-center justify-center gap-2 text-app-text/50"><ImagePlus size={30}/><span className="font-subheading text-sm">Choose Puja photo</span><span className="font-body text-[11px]">JPG, PNG or WEBP · max 8 MB</span></span>}
          <input type="file" accept="image/*" className="sr-only" onChange={selectFile}/>
        </label>
        <textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={280} placeholder="Write a short caption…" className="min-h-20 w-full resize-none rounded-2xl border border-app-border/10 bg-app-text/[.03] px-4 py-3 font-body text-sm outline-none focus:border-vermilion/40" />
        <select value={pujaId} onChange={e => setPujaId(e.target.value)} className="w-full rounded-2xl border border-app-border/10 bg-app-surface px-4 py-3 font-body text-sm text-app-text outline-none"><option value="">Tag a pandal (optional)</option>{pujas.map(p => <option key={p.id} value={p.id}>{p.name} — {p.area}</option>)}</select>
        {error && <p role="alert" className="rounded-2xl bg-vermilion/10 px-3 py-2 font-body text-xs text-vermilion">{error}</p>}
        <button disabled={busy || !file} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-crimson px-4 py-3 font-body text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Send size={16}/>{busy ? 'Publishing…' : 'Publish Puja Moment'}</button>
      </form>
    </section>

    <section>
      <div className="mb-3 flex items-end justify-between"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-vermilion">Community wall</p><h2 className="font-subheading mt-1 text-xl">Recent Puja Moments</h2></div><span className="font-body text-[11px] text-app-text/45">{posts.length} photos</span></div>
      {posts.length === 0 ? <div className="surface-card p-8 text-center"><Sparkles className="mx-auto text-marigold"/><p className="font-subheading mt-3 text-sm">Be the first to share a Puja moment.</p></div> : <div className="grid grid-cols-2 gap-3">{posts.map(post => <article key={post.id} className="overflow-hidden rounded-3xl border border-app-border/10 bg-app-surface shadow-sm"><div className="relative aspect-[4/5] overflow-hidden bg-app-text/5"><img src={post.image_url} alt={post.caption || `Puja photo by ${post.user_name}`} className="h-full w-full object-cover"/><a href={downloadUrl(post.image_url)} className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white" title="Download image"><Download size={15}/></a></div><div className="p-3"><p className="font-subheading truncate text-xs">{post.user_name}</p>{post.puja_name && <Link href={`/explore?puja=${post.puja_id}`} className="font-body mt-1 flex items-center gap-1 truncate text-[10px] text-vermilion"><MapPin size={10}/>{post.puja_name}</Link>}{post.caption && <p className="font-body mt-2 line-clamp-3 text-[11px] leading-4 text-app-text/60">{post.caption}</p>}</div></article>)}</div>}
    </section>
  </div>;
}
