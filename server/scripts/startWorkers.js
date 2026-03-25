import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq"; // ✅ FIX
import { redisConnection } from "../configs/redis.js";
import connectDB from "../configs/db.js";

import { scrapeGreenhouse } from "../scraper/sources/greenhouse.js";
import { scrapeLever } from "../scraper/sources/lever.js";
import { saveJobs } from "../services/jobServices.js";

console.log("Worker started...");
await connectDB();

new Worker(
  "scraperQueue",
  async (job) => {

    const { companySlug } = job.data;

    console.log("Processing:", companySlug);

    // ⚡ parallel scraping
    const [greenhouseJobs, leverJobs] = await Promise.all([
      scrapeGreenhouse(companySlug),
      scrapeLever(companySlug)
    ]);

    const jobs = [...greenhouseJobs, ...leverJobs];

    console.log("Jobs found:", jobs.length);

    await saveJobs(companySlug, jobs);

    console.log("Saved:", companySlug);

  },
  { connection: redisConnection }
);