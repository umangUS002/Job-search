import Company from "../models/Company.js";
import Job from "../models/Job.js";
import { detectLevel } from "../scraper/utils/parser.js";
import dotenv from "dotenv";
import { extractSkills } from "../utils/extractSkills.js";
import { esClient } from "../configs/elasticSearch.js";
dotenv.config();

export const saveJobs = async (companySlug, jobs) => {

  console.log("Saving jobs for:", companySlug);
  console.log("Job count:", jobs.length);

  let company = await Company.findOne({ name: companySlug });

  if (!company) {
    company = await Company.create({
      name: companySlug,
      image: `https://img.logo.dev/${companySlug}.com?token=${process.env.LOGO_DEV_PUBLISHABLE_KEY}`
    });
  }

  const jobList = jobs;

  // 🔥 1. SAVE TO MONGO
  await Job.bulkWrite(
    jobList.map(job => {

      const jobUrl = job.url || job.absolute_url;

      return {
        updateOne: {
          filter: { url: jobUrl },
          update: {
            $set: {
              title: job.title,
              location: job.location?.name || job.location,
              companyId: company._id,
              company: companySlug,
              skills: extractSkills(job.description),
              url: jobUrl,
              date: Date.now(),
              description: job.description || "",
              level: detectLevel(job.title)
            }
          },
          upsert: true
        }
      };

    })
  );

  console.log("MongoDB save completed");

  // 🔥 2. INDEX INTO ELASTICSEARCH (IMPORTANT)
  await Promise.all(
    jobList.map(async (job) => {

      try {

        const jobUrl = job.url || job.absolute_url;

        await esClient.index({
          index: "jobs",
          id: jobUrl, // unique id
          document: {
            title: job.title,
            description: job.description || "",
            location: job.location?.name || job.location,
            company: companySlug,
            skills: extractSkills(job.description),
            level: detectLevel(job.title)
          }
        });

      } catch (err) {
        console.log("ES indexing error:", err.message);
      }
      await esClient.indices.refresh({ index: "jobs" });
    })
  );

  console.log(`Elasticsearch indexed: ${jobList.length} jobs`);
};