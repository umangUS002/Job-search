import Company from "../models/Company.js";
import Job from "../models/Job.js";
import { detectLevel } from "../scraper/utils/parser.js";
import dotenv from "dotenv";
import { extractSkills } from "../utils/extractSkills.js";
dotenv.config();

export const saveJobs = async (companySlug, jobs) => {
  console.log("Saving jobs for:", companySlug);
  console.log("Job count:", jobs.length);

  let company = await Company.findOne({ name: companySlug });

  if (!company) {

    company = await Company.create({
      name: companySlug,

      // 🔥 company logo
      image: `https://img.logo.dev/${companySlug}.com?token=${process.env.LOGO_DEV_PUBLISHABLE_KEY}`
    });

  }

  const jobList = jobs.slice(0, 5); // your existing limit

  await Job.bulkWrite(

    jobList.map(job => {

      const jobUrl = job.url || job.absolute_url;

      return {
        updateOne: {

          filter: { url: jobUrl },

          update: {
            $set: {

              // ✅ EXISTING FIELDS (unchanged)
              title: job.title,
              location: job.location?.name || job.location,
              companyId: company._id,
              company: companySlug,
              skills: extractSkills(job.description),
              url: jobUrl,
              date: Date.now(),

              // ✅ NEW FIELDS (added safely)
              description: job.description || "",
              level: detectLevel(job.title)

            }
          },

          upsert: true
        }
      };

    })

  );

  console.log(`${jobList.length} jobs saved for ${companySlug}`);
};