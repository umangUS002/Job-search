import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { redisConnection } from "../configs/redis.js";
import { scrapeGreenhouse } from "../scraper/sources/greenhouse.js";
import connectDB from "../configs/db.js";
import { saveJobs } from "../services/jobServices.js";

console.log("Worker started...");
await connectDB();

new Worker(
  "scraperQueue",
  async (job) => {

    const { companySlug } = job.data;

    console.log("Processing:", companySlug);

    // 🔥 STEP 1: SCRAPE
    const jobs = await scrapeGreenhouse(companySlug);

    console.log("Jobs scraped:", jobs.length);

    // 🔥 STEP 2: SAVE
    await saveJobs(companySlug, jobs);

    console.log("Jobs saved:", companySlug);

  },
  { connection: redisConnection }
);