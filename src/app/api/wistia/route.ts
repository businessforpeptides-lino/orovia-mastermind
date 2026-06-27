import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') ?? 'medias/m5mbn78ywk';

  // Forward all params except 'path' to the Wistia API
  const forward = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'path') forward.set(key, value);
  });

  const qs = forward.toString();
  const url = `https://api.wistia.com/v1/${path}.json${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.WISTIA_API_TOKEN}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Wistia API error', status: res.status },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
