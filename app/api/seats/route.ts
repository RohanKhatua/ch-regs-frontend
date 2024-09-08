import { NextRequest, NextResponse } from "next/server";
import { scrapeAvailableSeats } from "@/lib/scraper";

export const revalidate = 0;

export async function GET(request: NextRequest) {
    const url = 'https://gravitas.vit.ac.in/events/ea3eb2e8-7036-4265-9c9d-ecb8866d176b'
    try {
        const availableSeats = await scrapeAvailableSeats(url);
        return NextResponse.json({ availableSeats });
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Failed to scrape available seats'}, {status: 500});
    }
}