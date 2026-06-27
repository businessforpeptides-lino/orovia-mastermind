import { NextResponse } from 'next/server';

const BASE   = process.env.AIRTABLE_BASE_ID!;
const TOKEN  = process.env.AIRTABLE_TOKEN!;
const TABLE  = 'Sales%20Calls%20Tracking';

function safeStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return ''; // catches {"error":"#ERROR!"}
  return String(v);
}

function getStatus(f: Record<string, unknown>): string {
  if (f['If "Closed"'])            return 'Closed';
  if (f['If "Deposit"'])           return 'Deposit';
  if (f['If "No Close"'])          return 'No Close';
  if (f['If "Didn\'t Show Up"'])   return 'No Show';
  if (f['If "Cancelled"'])         return 'Cancelled';
  return 'New';
}

export async function GET() {
  try {
    const allRecords: Record<string, unknown>[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
      url.searchParams.set('pageSize', '100');
      if (offset) url.searchParams.set('offset', offset);

      const res  = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${TOKEN}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Airtable ${res.status}`);
      const data = await res.json() as { records: { fields: Record<string, unknown> }[]; offset?: string };
      allRecords.push(...data.records.map(r => r.fields));
      offset = data.offset;
    } while (offset);

    const records = allRecords.map(f => ({
      leadName:  safeStr(f['Lead Name']),
      phone:     safeStr(f['Phone']),
      email:     safeStr(f['Email']),
      date:      safeStr(f['Appt Date/Time']) || safeStr(f['Raw Date']),
      closer:    safeStr(f['Raw Text (Closer Assigned)']),
      status:    getStatus(f),
      notes:     safeStr(f['Call Notes']),
      objection: safeStr(f['Objection']),
      cc:        Number(f['Cash Collected Per Call Taken'] ?? 0),
      campaign:  safeStr(f['Campaign']),
      source:    safeStr(f['Source']),
    }));

    const totalCalls  = records.length;
    const closedCalls = records.filter(r => r.status === 'Closed' || r.status === 'Deposit').length;
    const noCloses    = records.filter(r => r.status === 'No Close').length;
    const noShows     = records.filter(r => r.status === 'No Show').length;
    const showedUp    = totalCalls - noShows;
    const closeRate   = showedUp > 0 ? ((closedCalls / showedUp) * 100).toFixed(1) : '0';
    const totalCC     = records.reduce((a, r) => a + r.cc, 0);

    return NextResponse.json({
      records,
      kpis: { totalCalls, closedCalls, noCloses, noShows, closeRate, totalCC },
    });
  } catch (err) {
    console.error('Sales API error:', err);
    return NextResponse.json(
      { records: [], kpis: { totalCalls: 0, closedCalls: 0, noCloses: 0, noShows: 0, closeRate: '0', totalCC: 0 } },
      { status: 500 }
    );
  }
}
