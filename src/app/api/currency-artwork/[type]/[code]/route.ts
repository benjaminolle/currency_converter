import { NextResponse } from "next/server";

const cacheDurationSeconds = 60 * 60 * 24 * 30;

function artworkFallback() {
    const transparentGif = Buffer.from("R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", "base64");
    return new NextResponse(transparentGif, {
        headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-store",
        },
    });
}

interface RouteContext {
    params: Promise<{
        type: string
        code: string
    }>
}

export async function GET(_request: Request, { params }: RouteContext) {
    const { type, code: rawCode } = await params;
    const code = rawCode.toLowerCase();

    if (!/^[a-z0-9]{2,12}$/.test(code) || (type !== "crypto" && type !== "country")) {
        return NextResponse.json(
            { error: "Invalid artwork type or code." },
            { status: 400, headers: { "Cache-Control": "no-store" } }
        );
    }

    let url: URL;
    if (type === "crypto") {
        const token = process.env.LOGO_DEV_TOKEN;
        if (!token) {
            return artworkFallback();
        }

        url = new URL(`https://img.logo.dev/crypto/${code}`);
        url.search = new URLSearchParams({
            token,
            format: "png",
            retina: "true",
        }).toString();
    } else {
        if (!/^[a-z]{2}$/.test(code)) {
            return NextResponse.json(
                { error: "Country flags require a two-letter country code." },
                { status: 400, headers: { "Cache-Control": "no-store" } }
            );
        }
        url = new URL(`https://flagsapi.com/${code.toUpperCase()}/flat/64.png`);
    }

    let response: Response;
    try {
        response = await fetch(url, {
            next: { revalidate: cacheDurationSeconds },
        });
    } catch {
        return artworkFallback();
    }

    if (!response.ok) {
        return artworkFallback();
    }

    const contentType =
        response.headers.get("content-type") ??
        "image/png";
    if (!contentType.startsWith("image/")) {
        return artworkFallback();
    }

    return new NextResponse(await response.arrayBuffer(), {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": `public, max-age=${cacheDurationSeconds}, s-maxage=${cacheDurationSeconds}, stale-while-revalidate=31536000`,
        },
    });
}
