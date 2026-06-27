import { NextResponse } from 'next/server';

const BASE  = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;
const TABLE = 'Sales%20Calls%20Tracking';

export async function GET() {
  try {
    const allRecords: { recordId: string; fields: Record<string, unknown> }[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
      url.searchParams.set('pageSize', '100');
      url.searchParams.set('filterByFormula', 'AND({Revenue}>0,{Lead Name}!="")');
      if (offset) url.searchParams.set('offset', offset);

      const res  = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${TOKEN}` },
        next: { revalidate: 60 },
      });
      const data = await res.json() as {
        records: { id: string; fields: Record<string, unknown> }[];
        offset?: string;
      };
      allRecords.push(...data.records.map(r => ({ recordId: r.id, fields: r.fields })));
      offset = data.offset;
    } while (offset);

    const students = allRecords.map(r => ({
      recordId:  r.recordId,
      id:        (r.fields['ID'] as string) ?? r.recordId,
      name:      (r.fields['Lead Name'] as string) ?? 'Unknown',
      revenue:   Number(r.fields['Revenue']        ?? 0),
      collected: Number(r.fields['Cash Collected'] ?? 0),
    })).filter(s => s.revenue > 0);

    const totalRevenue   = students.reduce((a, s) => a + s.revenue,   0);
    const totalCollected = students.reduce((a, s) => a + s.collected, 0);

    return NextResponse.json({
      students,
      summary: {
        count:        students.length,
        totalRevenue,
        totalCollected,
        outstanding:  totalRevenue - totalCollected,
      },
    });
  } catch (err) {
    console.error('Students GET error:', err);
    return NextResponse.json({
      students: [],
      summary: { count: 0, totalRevenue: 0, totalCollected: 0, outstanding: 0 },
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, revenue, collected, closeDate } = body as {
      name: string;
      revenue: number;
      collected: number;
      closeDate?: string;
    };

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const fields: Record<string, unknown> = {
      'Lead Name':     name,
      'Revenue':       Number(revenue)   || 0,
      'Cash Collected': Number(collected) || 0,
      'Status':        'Closed',
    };
    if (closeDate) fields['Date'] = closeDate;

    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ recordId: data.id, success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('recordId');
    if (!recordId) return NextResponse.json({ error: 'Missing recordId' }, { status: 400 });

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE}/${TABLE}/${recordId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` },
      },
    );

    if (!res.ok) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
