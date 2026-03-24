import axios from "axios";

export async function scrapeGreenhouse(company) {

  const baseUrl = `https://boards-api.greenhouse.io/v1/boards/${company}`;

  try {

    const res = await axios.get(`${baseUrl}/jobs`);

    const jobs = [];

    for (const job of res.data.jobs) {

      // 🔥 fetch full job details
      const detailRes = await axios.get(
        `${baseUrl}/jobs/${job.id}`
      );

      const detail = detailRes.data;

      jobs.push({
        ...job, // keep all original fields

        // overwrite / add extra fields
        description: detail.content || "",
        location: job.location?.name || "Remote",
        url: job.absolute_url
      });

      // prevent rate limit
      await new Promise(r => setTimeout(r, 150));
    }

    return jobs;

  } catch (err) {

    console.log("Greenhouse error:", company);

    return [];
  }
}