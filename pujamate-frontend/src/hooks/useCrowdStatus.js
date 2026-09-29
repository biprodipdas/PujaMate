'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function useCrowdStatus(pujaId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pujaId) { setStatus(null); setLoading(false); return undefined; }
    let cancelled = false;
    const load = () => {
      setLoading(true);
      api.getCrowdStatus(pujaId).then((data) => { if (!cancelled) setStatus(data); }).catch(() => { if (!cancelled) setStatus(null); }).finally(() => { if (!cancelled) setLoading(false); });
    };
    load();
    const timer = window.setInterval(load, 60000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [pujaId]);

  return { status, loading };
}
