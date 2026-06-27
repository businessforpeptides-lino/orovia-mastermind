import { NextResponse } from 'next/server';

const FORM_ID = 'HI1uBTdh'; // 1-1 Application form

interface TFResponse {
  submitted_at: string;
  hidden: Record<string, string>;
}

export async function GET() {
  try {
    // Fetch up to 1000 responses (well above current 114)
    const res = await fetch(
      `https://api.typeform.com/forms/${FORM_ID}/responses?page_size=1000&sort=submitted_at,desc`,
      {
        headers: { Authorization: `Bearer ${process.env.TYPEFORM_API_TOKEN}` },
        next: { revalidate: 120 },
      },
    );

    if (!res.ok) throw new Error(`Typeform API returned ${res.status}`);
    const data = await res.json();
    const items: TFResponse[] = data.items ?? [];

    // Process UTM fields from hidden
    const utmSrc: Record<string, number> = {};
    const utmMed: Record<string, number> = {};
    const utmCam: Record<string, number> = {};
    const utmCon: Record<string, number> = {};
    const dayMap: Record<string, number> = {};

    for (const item of items) {
      const h = item.hidden ?? {};
      const src = h.utm_source?.trim() || '(direct)';
      const med = h.utm_medium?.trim() || '(none)';
      const cam = h.utm_campaign?.trim() || '(none)';
      const con = h.utm_content?.trim() || '(none)';

      utmSrc[src] = (utmSrc[src] ?? 0) + 1;
      utmMed[med] = (utmMed[med] ?? 0) + 1;
      utmCam[cam] = (utmCam[cam] ?? 0) + 1;
      utmCon[con] = (utmCon[con] ?? 0) + 1;

      const day = (item.submitted_at ?? '').slice(0, 10);
      if (day) dayMap[day] = (dayMap[day] ?? 0) + 1;
    }

    const rank = (map: Record<string, number>, max = 8) =>
      Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, max)
        .map(([label, count]) => ({ label, count }));

    // Last 30 days daily submissions
    const daily = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { day: label, submissions: dayMap[key] ?? 0 };
    });

    // Recent 20 submissions
    const recent = items.slice(0, 20).map(item => {
      const h = item.hidden ?? {};
      const dt = new Date(item.submitted_at ?? '');
      const date = isNaN(dt.getTime()) ? '—'
        : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date,
        source: h.utm_source?.trim() || '(direct)',
        medium: h.utm_medium?.trim() || '(none)',
        campaign: h.utm_campaign?.trim() || '(none)',
        content: h.utm_content?.trim() || '(none)',
      };
    });

    return NextResponse.json({
      total: data.total_items ?? items.length,
      utm: {
        sources:   rank(utmSrc),
        mediums:   rank(utmMed),
        campaigns: rank(utmCam),
        content:   rank(utmCon),
      },
      daily,
      recent,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
