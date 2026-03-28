import { Worker } from "bullmq";
import { redisConnection } from "../configs/redis.js";

import { scrapeGreenhouse } from "../scraper/sources/greenhouse.js";
import { scrapeLever } from "../scraper/sources/lever.js";
import { saveJobs } from "../services/jobServices.js";
import connectDB from "../configs/db.js";

console.log("🚀 Worker starting...");
await connectDB();

new Worker(
  "scraperQueue",
  async (job) => {

    const { companySlug } = job.data;

    console.log("🔄 Processing:", companySlug);

    try {

      const [greenhouseJobs, leverJobs] = await Promise.all([
        scrapeGreenhouse(companySlug),
        scrapeLever(companySlug)
      ]);

      const jobs = [...greenhouseJobs, ...leverJobs];

      console.log(`📊 ${companySlug} → ${jobs.length} jobs`);

      if (jobs.length > 0) {
        await saveJobs(companySlug, jobs);
      }

      console.log("✅ Saved:", companySlug);

    } catch (err) {
      console.log("❌ Worker error:", err.message);
    }

  },
  { connection: redisConnection }
);