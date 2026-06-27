import { NextResponse } from 'next/server';

const BASE = 'https://api.calendly.com';

async function cal(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/${path}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}` },
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error(`Calendly /${path} returned ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    // 1. Who am I?
    const me = await cal('users/me');
    const userUri: string = me.resource?.uri;
    if (!userUri) throw new Error('Could not resolve Calendly user URI');

    // 2. Find "Discovery Call" event type
    const etData = await cal('event_types', { user: userUri, active: 'true', count: '100' });
    const discoveryType = (etData.collection ?? []).find(
      (et: { name: string; uri: string }) =>
        et.name.toLowerCase().includes('discovery')
    );

    // 3. Pull scheduled events — last 90 days, status active
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const params: Record<string, string> = {
      status: 'active',
      count: '100',
      min_start_time: since.toISOString(),
      sort: 'start_time:desc',
    };
    if (discoveryType?.uri) {
      params.event_type = discoveryType.uri;
    } else {
      // fallback: all events for this user
      params.user = userUri;
    }

    const evtData = await cal('scheduled_events', params);
    const collection: Array<{ start_time: string; name?: string }> = evtData.collection ?? [];

    // 4. Group by day for last 30 days
    const dayMap: Record<string, number> = {};
    for (const evt of collection) {
      const day = (evt.start_time ?? '').slice(0, 10);
      if (day) dayMap[day] = (dayMap[day] ?? 0) + 1;
    }

    const daily = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { day: label, calls: dayMap[key] ?? 0 };
    });

    return NextResponse.json({
      total: collection.length,
      event_type_name: discoveryType?.name ?? 'All Events',
      daily,
      next_page: evtData.pagination?.next_page ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
