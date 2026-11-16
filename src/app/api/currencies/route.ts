import { NextResponse } from 'next/server';

export async function GET() {
    const res = await fetch('https://api.frankfurter.dev/v2/currencies',
        { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
        return NextResponse.json(
            { error: "Failed to fetch currencies" },
            { status: res.status }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}