import { NextResponse } from 'next/server';

const BASE = 'https://api.calendly.com';
const SLUGS = ['discovery-call', 'dialing-calendar'] as const;

type Slug = typeof SLUGS[number];

async function cal(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/${path}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}` },
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error(`Calendly /${path} returned ${res.status}`);
  return res.json();
}

function buildDaily(collection: Array<{ start_time?: string }>) {
  const dayMap: Record<string, number> = {};
  for (const evt of collection) {
    const day = (evt.start_time ?? '').slice(0, 10);
    if (day) dayMap[day] = (dayMap[day] ?? 0) + 1;
  }
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calls: dayMap[key] ?? 0,
    };
  });
}

export async function GET() {
  try {
    const me = await cal('users/me');
    const userUri: string = me.resource?.uri;
    if (!userUri) throw new Error('Could not resolve user URI');

    const etData = await cal('event_types', {
      user: userUri,
      active: 'true',
      count: '100',
    });
    const allTypes: Array<{ name: string; uri: string; slug?: string }> =
      etData.collection ?? [];

    const since = new Date();
    since.setDate(since.getDate() - 90);

    const bySlug: Record<Slug, { total: number; event_type_name: string; daily: Array<{ day: string; calls: number }> }> = {
      'discovery-call':   { total: 0, event_type_name: 'Discovery Call',   daily: [] },
      'dialing-calendar': { total: 0, event_type_name: 'Dialing Calendar', daily: [] },
    };

    for (const slug of SLUGS) {
      const et = allTypes.find(t =>
        t.slug === slug ||
        t.name.toLowerCase().replace(/[\s_]+/g, '-') === slug ||
        t.name.toLowerCase().includes(slug.replace(/-/g, ' '))
      );

      const params: Record<string, string> = {
        status: 'active',
        count: '100',
        min_start_time: since.toISOString(),
        sort: 'start_time:desc',
      };
      if (et?.uri) params.event_type = et.uri;
      else         params.user = userUri;

      const evtData = await cal('scheduled_events', params);
      const collection = evtData.collection ?? [];

      bySlug[slug] = {
        total:           collection.length,
        event_type_name: et?.name ?? slug,
        daily:           buildDaily(collection),
      };
    }

    return NextResponse.json({ bySlug });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
