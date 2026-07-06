import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    try {
        const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
        nominatimUrl.searchParams.set("q", q);
        nominatimUrl.searchParams.set("format", "json");
        nominatimUrl.searchParams.set("addressdetails", "1");
        nominatimUrl.searchParams.set("limit", "1");
        nominatimUrl.searchParams.set("countrycodes", "tr");

        const response = await fetch(nominatimUrl.toString(), {
            headers: {
                "User-Agent": "SS-Gayrimenkul-App/1.0 (contact: info@ssgayrimenkul.com)",
                "Referer": "https://ssgayrimenkul.com" // Recommended for Nominatim
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Nominatim API error" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Geocode Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
