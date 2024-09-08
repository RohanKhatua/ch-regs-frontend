import { NextRequest, NextResponse } from "next/server";
import { scrapeAvailableSeats } from "@/lib/scraper";

export async function GET(request: NextRequest) {
    const url = 'https://gravitas.vit.ac.in/events/ea3eb2e8-7036-4265-9c9d-ecb8866d176b'
    try {
        const availableSeats = await scrapeAvailableSeats(url);
        const response = NextResponse.json({ availableSeats });
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
        response.headers.set('CDN-Cache-Control', 'no-store')
        response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        return NextResponse.json({ availableSeats });
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Failed to scrape available seats'}, {status: 500});
    }
}