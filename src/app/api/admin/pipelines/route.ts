import { NextResponse } from 'next/server';

const CLOSE_KEY = process.env.CLOSE_API_KEY;

interface CloseOpp {
  id: string;
  lead_name: string;
  pipeline_id: string;
  pipeline_name: string;
  status_label: string;
  status_type: string;
  value: number;
  date_created: string;
}

interface ClosePipeline {
  id: string;
  name: string;
  statuses: Array<{ id: string; label: string; type: string }>;
}

export async function GET() {
  if (!CLOSE_KEY) {
    return NextResponse.json({ pipelines: [], connected: false });
  }

  try {
    const auth = Buffer.from(CLOSE_KEY + ':').toString('base64');
    const headers = { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' };

    // Fetch pipeline definitions
    const pipeRes  = await fetch('https://api.close.com/api/v1/pipeline/', { headers, next: { revalidate: 300 } });
    const pipeData = await pipeRes.json() as { data: ClosePipeline[] };
    const pipelineDefs = pipeData.data ?? [];

    // Fetch all opportunities (paginated, cap at 600)
    const allOpps: CloseOpp[] = [];
    let hasMore = true;
    let skip = 0;
    while (hasMore && skip < 600) {
      const res  = await fetch(
        `https://api.close.com/api/v1/opportunity/?_limit=100&_skip=${skip}&_fields=id,lead_name,pipeline_id,pipeline_name,status_label,status_type,value,date_created`,
        { headers, next: { revalidate: 120 } }
      );
      const data = await res.json() as { data?: CloseOpp[]; has_more?: boolean };
      allOpps.push(...(data.data ?? []));
      hasMore = data.has_more ?? false;
      skip += 100;
    }

    // Attach opportunities to each pipeline
    const pipelines = pipelineDefs.map(p => ({
      id:       p.id,
      name:     p.name,
      stages:   p.statuses.map(s => ({ label: s.label, type: s.type })),
      opps:     allOpps
        .filter(o => o.pipeline_id === p.id)
        .map(o => ({
          id:          o.id,
          leadName:    o.lead_name || 'Unknown',
          statusLabel: o.status_label,
          statusType:  o.status_type,
          value:       o.value ?? 0,
          dateCreated: o.date_created,
        })),
    }));

    return NextResponse.json({ pipelines, connected: true });
  } catch (err) {
    console.error('Pipelines API error:', err);
    return NextResponse.json({ pipelines: [], connected: false });
  }
}
