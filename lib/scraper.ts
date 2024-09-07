import puppeteer from "puppeteer-core";

export async function scrapeAvailableSeats(url: string): Promise<string> {
    const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
    });
    const page = await browser.newPage();

    try {
        // Add a timestamp to the URL to prevent caching
        const cacheBustedUrl = `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;
        await page.goto(cacheBustedUrl, { waitUntil: "networkidle0" });
        await page.waitForSelector('.slots button p:last-child');
        const seatsText = await page.$eval('.slots button p:last-child', (el) => el.textContent);
        const availableSeats = seatsText?.match(/\d+/)?.[0] || "0";
        return availableSeats;
    } finally {
        await browser.close();
    }
}