import { chromium } from "playwright";
import { detectCategory, detectLevel } from "../utils/parser.js";

export async function scrapeCareerPage(url, company) {

  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.waitForTimeout(2000);

  const jobs = await page.evaluate((company) => {

    const cards = document.querySelectorAll("a");

    const results = [];

    cards.forEach(card => {

      const title = card.innerText;

      if (!title || title.length < 5) return;

      results.push({

        title,

        description: "",

        location: "Remote",

        category: "Other",

        level: "Mid",

        salary: null,

        date: Date.now(),

        company,

        url: card.href

      });

    });

    return results;

  }, company);

  await browser.close();

  return jobs;

}