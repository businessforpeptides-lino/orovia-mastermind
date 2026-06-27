import { NextResponse } from 'next/server';

const FORM_ID = 'HI1uBTdh';

interface TFItem {
  submitted_at?: string;
  hidden?: Record<string, string>;
}

export async function GET() {
  try {
    const res = await fetch(
      `https://api.typeform.com/forms/${FORM_ID}/responses?page_size=1000&sort=submitted_at,desc`,
      {
        headers: { Authorization: `Bearer ${process.env.TYPEFORM_API_TOKEN}` },
        next: { revalidate: 120 },
      },
    );
    if (!res.ok) throw new Error(`Typeform returned ${res.status}`);
    const data = await res.json();
    const items: TFItem[] = data.items ?? [];

    const utmSrc: Record<string, number> = {};
    const utmCam: Record<string, number> = {};
    const utmMed: Record<string, number> = {};
    const dayMap: Record<string, number> = {};

    for (const item of items) {
      const h = item.hidden ?? {};
      const src = h.utm_source?.trim() || '(direct)';
      const cam = h.utm_campaign?.trim() || '(none)';
      const med = h.utm_medium?.trim() || '(none)';
      utmSrc[src] = (utmSrc[src] ?? 0) + 1;
      utmCam[cam] = (utmCam[cam] ?? 0) + 1;
      utmMed[med] = (utmMed[med] ?? 0) + 1;
      const day = (item.submitted_at ?? '').slice(0, 10);
      if (day) dayMap[day] = (dayMap[day] ?? 0) + 1;
    }

    const rank = (map: Record<string, number>, max = 8) =>
      Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, max)
        .map(([label, count]) => ({ label, count }));

    const daily = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: dayMap[key] ?? 0,
      };
    });

    const recent = items.slice(0, 20).map(item => {
      const h = item.hidden ?? {};
      const dt = new Date(item.submitted_at ?? '');
      return {
        date: isNaN(dt.getTime())
          ? '—'
          : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        source:   h.utm_source?.trim()   || '(direct)',
        medium:   h.utm_medium?.trim()   || '(none)',
        campaign: h.utm_campaign?.trim() || '(none)',
        content:  h.utm_content?.trim()  || '(none)',
      };
    });

    return NextResponse.json({
      total:     data.total_items ?? items.length,
      sources:   rank(utmSrc),
      campaigns: rank(utmCam),
      mediums:   rank(utmMed),
      daily,
      recent,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
