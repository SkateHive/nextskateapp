import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { community, last } = body;

    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "bridge.list_subscribers",
        params: { community, limit: 100, last },
        id: 1,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Hive API error: ${response.statusText}` }, { status: response.status });
    }

    const followersData = await response.json();
    if (!Array.isArray(followersData.result)) {
      return NextResponse.json({ error: 'Invalid data structure from Hive API' }, { status: 500 });
    }

    const newSubscribers = followersData.result.map((subscriber: any) => {
      const author = subscriber[0];

      const contributions = [
        { community: "steemskate", hpContribution: Math.random() * (100 - 50) + 50 },
      ];
      

      return { author, contributions };
    });

    const hasMore = followersData.result.length === 100;
    const newLastFollower = hasMore ? followersData.result[followersData.result.length - 1][0] : null;

    return NextResponse.json({ subscribers: newSubscribers, lastFollower: newLastFollower, hasMore });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
