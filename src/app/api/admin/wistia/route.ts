import { NextResponse } from 'next/server';

const MEDIA_ID = 'm5mbn78ywk';
const BASE = 'https://api.wistia.com/v1';

async function wistia(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/${path}.json${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.WISTIA_API_TOKEN}` },
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error(`Wistia ${path} returned ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const [media, events, engagement] = await Promise.all([
      wistia(`medias/${MEDIA_ID}`),
      wistia('stats/events', { media_id: MEDIA_ID, per_page: '100' }),
      wistia(`stats/medias/${MEDIA_ID}/engagement`).catch(() => null),
    ]);

    const stats = media?.stats ?? {};
    const evtList: Array<{
      visitor_key?: string;
      received_at?: string;
      percent_viewed?: number;
      country?: string;
      city?: string;
      embed_url?: string;
    }> = Array.isArray(events) ? events : [];

    const countryMap: Record<string, number> = {};
    const cityMap: Record<string, number> = {};
    const dayMap: Record<string, number> = {};
    const drops = [0, 0, 0, 0];

    for (const evt of evtList) {
      const cc = (evt.country ?? '').toUpperCase();
      if (cc) countryMap[cc] = (countryMap[cc] ?? 0) + 1;
      if (evt.city) cityMap[evt.city] = (cityMap[evt.city] ?? 0) + 1;
      const day = (evt.received_at ?? '').slice(0, 10);
      if (day) dayMap[day] = (dayMap[day] ?? 0) + 1;
      const pct = evt.percent_viewed ?? 0;
      if      (pct <= 0.25) drops[0]++;
      else if (pct <= 0.50) drops[1]++;
      else if (pct <= 0.75) drops[2]++;
      else                  drops[3]++;
    }

    const n = evtList.length || 1;
    const daily = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: dayMap[key] ?? 0,
      };
    });

    // Retention curve
    let retention: Array<{ time: string; pct: number }> | null = null;
    if (engagement) {
      if (Array.isArray(engagement.engagement_data) && engagement.engagement_data.length > 0) {
        const arr = engagement.engagement_data as Array<{ time: number; percent: number }>;
        const step = Math.max(1, Math.floor(arr.length / 14));
        retention = arr.filter((_, i) => i % step === 0).map(p => ({
          time: `${Math.floor(p.time / 60)}:${String(p.time % 60).padStart(2, '0')}`,
          pct: Math.min(100, Math.round(p.percent * 100)),
        }));
      } else if (Array.isArray(engagement.engagement) && engagement.engagement.length > 0) {
        const arr = engagement.engagement as number[];
        const step = Math.max(1, Math.floor(arr.length / 14));
        retention = arr.filter((_, i) => i % step === 0).map((v, i) => ({
          time: `${Math.floor((i * step) / 60)}:${String((i * step) % 60).padStart(2, '0')}`,
          pct: Math.min(100, Math.round(v * 100)),
        }));
      }
    }

    return NextResponse.json({
      name: media?.name ?? 'VSL',
      stats: {
        load_count:              stats.load_count ?? 0,
        play_count:              stats.play_count ?? 0,
        play_rate:               stats.play_rate ?? 0,
        hours_watched:           stats.hours_watched ?? 0,
        average_percent_watched: stats.average_percent_watched ?? 0,
      },
      countries: Object.entries(countryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([code, count]) => ({ code, count })),
      cities: Object.entries(cityMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([city, count]) => ({ city, count })),
      dropoff: drops.map((total, i) => ({
        label: ['0–25%', '26–50%', '51–75%', '76–100%'][i],
        total,
        pct: Math.round((total / n) * 100),
      })),
      highEngPct: Math.round((drops[3] / n) * 100),
      lowEngPct:  Math.round((drops[0] / n) * 100),
      daily,
      retention,
      totalEvents: evtList.length,
      recentEvents: evtList.slice(0, 20).map((evt, i) => {
        let source = '(direct)';
        try {
          const u = new URL(evt.embed_url ?? '');
          source = u.searchParams.get('utm_source') ?? '(direct)';
        } catch { /* no-op */ }
        const raw = (evt.received_at ?? '').replace(' UTC', 'Z');
        const dt = new Date(raw);
        return {
          id: evt.visitor_key?.slice(-8) ?? `${i + 1}`,
          watchPct: Math.round((evt.percent_viewed ?? 0) * 100),
          city: evt.city ?? '',
          country: evt.country ?? '',
          source,
          date: isNaN(dt.getTime())
            ? '—'
            : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      }),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
