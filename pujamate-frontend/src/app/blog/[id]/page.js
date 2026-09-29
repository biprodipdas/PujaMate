'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function BlogDetailPage() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (params?.id) api.getBlog(params.id).then(data => setBlog(data.blog)).catch(err => setError(err.message));
  }, [params]);

  if (error) return <div className="surface-card p-6 font-body text-sm text-vermilion">{error}</div>;
  if (!blog) return <div className="surface-card p-6 font-body text-sm text-app-text/55">Loading story…</div>;

  return <article className="pb-8">
    <Link href="/blog" className="mb-4 inline-flex items-center gap-2 font-body text-xs font-bold text-vermilion"><ArrowLeft size={14}/> Back to Puja Blog</Link>
    {blog.cover_image_url && <img src={blog.cover_image_url} alt="" className="mb-5 h-64 w-full rounded-[2rem] object-cover sm:h-80"/>}
    <span className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-vermilion">{blog.is_sample ? 'PujaMate sample story' : 'Community story'}</span>
    <h1 className="font-heading mt-3 text-4xl leading-tight sm:text-5xl">{blog.title}</h1>
    <div className="mt-3 flex flex-wrap gap-3 font-body text-xs text-app-text/50">
      <span>By {blog.author_name || 'PujaMate'}</span><span>·</span><span>{new Date(blog.created_at).toLocaleDateString('en-IN')}</span>
      {blog.puja_name && <><span>·</span><span className="inline-flex items-center gap-1 text-vermilion"><MapPin size={12}/>{blog.puja_name}</span></>}
    </div>
    <div className="surface-card mt-6 p-5 sm:p-7"><div className="whitespace-pre-line font-body text-[15px] leading-8 text-app-text/75">{blog.content}</div></div>
  </article>;
}
