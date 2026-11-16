import { NextResponse } from 'next/server';

const refreshCooldownMs = 30_000;
const refreshTimestamps = new Map<string, number>();

function getRequesterKey(request: Request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    return forwardedFor?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base')?.toLowerCase();
    const quote = searchParams.get('quote')?.toLowerCase();

    if (!base || !quote || !/^[a-z0-9]{3,12}$/.test(base) || !/^[a-z0-9]{3,12}$/.test(quote)) {
        return NextResponse.json(
            { error: "Provide valid base and quote currency codes." },
            { status: 400 }
        );
    }

    const url = `https://api.frankfurter.dev/v2/rate/${base}/${quote}`;
    const refresh = searchParams.get('refresh') === 'true';

    if (refresh) {
        const now = Date.now();
        const requesterKey = getRequesterKey(request);
        const allowedAt = refreshTimestamps.get(requesterKey) ?? 0;

        if (allowedAt > now) {
            const retryAfter = Math.ceil((allowedAt - now) / 1000);
            return NextResponse.json(
                { error: `Please wait ${retryAfter} seconds before refreshing rates again.` },
                {
                    status: 429,
                    headers: {
                        'Cache-Control': 'no-store',
                        'Retry-After': String(retryAfter),
                    },
                }
            );
        }

        for (const [key, expiresAt] of refreshTimestamps) {
            if (expiresAt <= now) {
                refreshTimestamps.delete(key);
            }
        }
        refreshTimestamps.set(requesterKey, now + refreshCooldownMs);
    }

    const res = await fetch(
        url,
        refresh ? { cache: 'no-store' } : { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
        return NextResponse.json(
            { error: "Failed to fetch rates" },
            { status: res.status }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}