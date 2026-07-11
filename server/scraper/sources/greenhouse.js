import axios from "axios";
import { isIndiaJob, isEngineeringAndJuniorJob } from "../utils/parser.js";

export async function scrapeGreenhouse(company) {

  const baseUrl = `https://boards-api.greenhouse.io/v1/boards/${company}`;

  try {

    const res = await axios.get(`${baseUrl}/jobs`);

    const allJobs = res.data.jobs || [];

    // Filter first by location and engineering title to avoid fetching details for irrelevant roles
    const suitableJobs = allJobs.filter(job => {
      const location = job.location?.name || "";
      return isIndiaJob(location) && isEngineeringAndJuniorJob(job.title);
    });

    console.log(`Greenhouse: ${company} has ${suitableJobs.length} matching engineering/India jobs out of ${allJobs.length} total.`);

    // ⚡ PARALLEL FETCH (only for suitable jobs!)
    const jobs = await Promise.all(
      suitableJobs.map(async (job) => {

        try {

          const location = job.location?.name || "";

          const detailRes = await axios.get(
            `${baseUrl}/jobs/${job.id}`,
            { timeout: 5000 }
          );

          const detail = detailRes.data;

          return {
            title: job.title,
            description: detail.content || "",
            location: location || "Remote",
            url: job.absolute_url,
            companyName: company
          };

        } catch (err) {
          console.log(`Failed detail fetch for ${job.title}:`, err.message);
          return null;
        }

      })
    );

    // remove nulls
    const filteredJobs = jobs.filter(Boolean);

    console.log(`Scraped ${filteredJobs.length} jobs from ${company}`);

    return filteredJobs;

  } catch (err) {

    console.log("Greenhouse error:", company);

    return [];
  }
}