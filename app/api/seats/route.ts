import { NextRequest, NextResponse } from "next/server";
import { scrapeAvailableSeats } from "@/lib/scraper";
import { MAX_DATA_POINTS, TOTAL_SEATS } from "@/lib/constants";
import redisClient from "@/lib/init-redis";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const url =
    "https://gravitas.vit.ac.in/events/ea3eb2e8-7036-4265-9c9d-ecb8866d176b";
  const redisKey = `current_reg_history:${url}`;
  try {
    const availableSeats = await scrapeAvailableSeats(url);
    const currentSeats = TOTAL_SEATS - Number(availableSeats);
    const timestamp = Date.now();
    redisClient.lPush(
      redisKey,
      JSON.stringify({ timestamp, seats: currentSeats }),
    );
    redisClient.lTrim(redisKey, 0, MAX_DATA_POINTS - 1);
    const historicalData = await redisClient.lRange(redisKey, 0, -1);
    const historicalDataParsed = historicalData.map((data: string) =>
      JSON.parse(data),
    );

    return NextResponse.json({
      currentSeats,
      historicalData: historicalDataParsed,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to scrape available seats" },
      { status: 500 },
    );
  }
}
