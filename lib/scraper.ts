import puppeteer from "puppeteer";

export async function scrapeAvailableSeats(url: string): Promise<string> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle0" });
        await page.waitForSelector('.slots button p:last-child')
        const seatsText = await page.$eval('.slots button p:last-child', (el) => el.textContent);
        const availableSeats = seatsText?.match(/\d+/)?.[0] || "0";
        return availableSeats;
    }
    finally {
        await browser.close();
    }
}