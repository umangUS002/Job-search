import Company from "../models/Company.js";
import Job from "../models/Job.js";
import { detectLevel, extractSalary } from "../scraper/utils/parser.js";
import dotenv from "dotenv";
import { extractSkills } from "../utils/extractSkills.js";
dotenv.config();

export const saveJobs = async (companySlug, jobs) => {

  console.log("Saving jobs for:", companySlug);
  console.log("Job count:", jobs.length);

  if (companySlug === "remoteok" || companySlug === "majorComps") {
    const bulks = [];
    for (const job of jobs) {
      const name = job.companyName || "Remote Company";
      let company = await Company.findOne({ name: name });

      if (!company) {
        company = await Company.create({
          name: name,
          image: `https://img.logo.dev/${name.replace(/\s+/g, '').toLowerCase()}.com?token=${process.env.LOGO_DEV_PUBLISHABLE_KEY}`
        });
      }

      const jobUrl = job.url;
      const salaryVal = job.salary || extractSalary(job.description, job.title);

      bulks.push({
        updateOne: {
          filter: { url: jobUrl },
          update: {
            $set: {
              title: job.title,
              location: job.location,
              companyId: company._id,
              company: name,
              skills: extractSkills(job.description),
              url: jobUrl,
              date: Date.now(),
              description: job.description || "",
              level: detectLevel(job.title),
              salary: salaryVal
            }
          },
          upsert: true
        }
      });
    }

    if (bulks.length > 0) {
      await Job.bulkWrite(bulks);
    }
    console.log("MongoDB RemoteOK save completed");

  } else {
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
        console.log(`  👉 Saving Job: ${job.title} at ${companySlug} (${job.location?.name || job.location || "Remote"})`);

        const salaryVal = job.salary || extractSalary(job.description, job.title);

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
                level: detectLevel(job.title),
                salary: salaryVal
              }
            },
            upsert: true
          }
        };

      })
    );

    console.log("MongoDB save completed");
  }

};