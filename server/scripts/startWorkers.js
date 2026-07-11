import { Worker } from "bullmq";
import { redisConnection } from "../configs/redis.js";

import { scrapeGreenhouse } from "../scraper/sources/greenhouse.js";
import { scrapeLever } from "../scraper/sources/lever.js";
import { scrapeRemoteOK } from "../scraper/sources/remoteok.js";
import { scrapeMajorComps } from "../scraper/sources/majorComps.js";
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
      let jobs = [];

      if (companySlug === "remoteok") {
        jobs = await scrapeRemoteOK();
      } else if (companySlug === "majorComps") {
        jobs = await scrapeMajorComps();
      } else {
        const [greenhouseJobs, leverJobs] = await Promise.all([
          scrapeGreenhouse(companySlug),
          scrapeLever(companySlug)
        ]);
        jobs = [...greenhouseJobs, ...leverJobs];
      }

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