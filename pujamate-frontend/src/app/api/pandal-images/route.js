import { NextResponse } from 'next/server';

const API = 'https://commons.wikimedia.org/w/api.php';

function cleanTitle(value) {
  return String(value || '').replace(/^File:/i, '').trim();
}

async function requestCommons(params) {
  const url = new URL(API);
  Object.entries({ format: 'json', origin: '*', ...params }).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  const response = await fetch(url, {
    next: { revalidate: 86400 },
    headers: { 'User-Agent': 'PujaMate/2026 (pandal image lookup)' },
  });
  if (!response.ok) throw new Error(`Wikimedia request failed: ${response.status}`);
  return response.json();
}

function toImage(page) {
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl && !info?.url) return null;
  return {
    url: info.thumburl || info.url,
    label: 'Previous-year / archival photo from Wikimedia Commons',
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(String(page.title || '').replace(/^File:/i, ''))}`,
  };
}

async function resolveFiles(files) {
  const unique = [...new Set(files.map(cleanTitle).filter(Boolean))].slice(0, 4);
  if (!unique.length) return [];
  const results = await Promise.all(unique.map(async (filename) => {
    try {
      const data = await requestCommons({
        action: 'query',
        prop: 'imageinfo',
        titles: `File:${filename}`,
        iiprop: 'url|mime',
        iiurlwidth: 900,
      });
      const page = Object.values(data?.query?.pages || {})[0];
      return toImage(page);
    } catch (_) {
      return null;
    }
  }));
  return results.filter(Boolean);
}

async function searchName(name) {
  const query = `${String(name || '').trim()} Durga Puja`;
  if (!query.trim()) return [];
  const data = await requestCommons({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: 6,
    gsrlimit: 3,
    prop: 'imageinfo',
    iiprop: 'url|mime',
    iiurlwidth: 900,
  });
  return Object.values(data?.query?.pages || {}).map(toImage).filter(Boolean);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const files = searchParams.get('files');
  const name = searchParams.get('name');
  try {
    const images = files ? await resolveFiles(files.split('|')) : await searchName(name);
    return NextResponse.json(
      { images },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    );
  } catch (error) {
    return NextResponse.json({ images: [], error: error.message || 'Image lookup failed.' });
  }
}
