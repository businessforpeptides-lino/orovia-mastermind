import { NextResponse } from 'next/server';

const CLOSE_KEY = process.env.CLOSE_API_KEY;

export async function GET() {
  if (!CLOSE_KEY) {
    return NextResponse.json({ leads: [], connected: false });
  }

  try {
    const allLeads: Array<{
      id: string;
      display_name: string;
      status_label: string;
      date_created: string;
      contacts: Array<{
        emails: Array<{ email: string }>;
        phones: Array<{ phone_formatted: string }>;
      }>;
    }> = [];
    let hasMore = true;
    let skip = 0;
    const limit = 100;
    const auth = Buffer.from(CLOSE_KEY + ':').toString('base64');

    while (hasMore) {
      const res = await fetch(
        `https://api.close.com/api/v1/lead/?_limit=${limit}&_skip=${skip}&_fields=id,display_name,status_label,date_created,contacts`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 120 },
        }
      );
      const data = await res.json() as { data?: typeof allLeads; has_more?: boolean };
      allLeads.push(...(data.data ?? []));
      hasMore = data.has_more ?? false;
      skip += limit;
      if (skip > 500) break; // safety cap at 500 leads
    }

    const leads = allLeads.map(l => ({
      id:           l.id,
      name:         l.display_name || 'Unknown',
      email:        l.contacts?.[0]?.emails?.[0]?.email ?? '',
      phone:        l.contacts?.[0]?.phones?.[0]?.phone_formatted ?? '',
      dateCreated:  l.date_created ?? '',
      statusLabel:  l.status_label ?? 'Opt-In',
    }));

    return NextResponse.json({ leads, connected: true });
  } catch (err) {
    console.error('CRM API error:', err);
    return NextResponse.json({ leads: [], connected: false });
  }
}
