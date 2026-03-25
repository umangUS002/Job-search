import axios from "axios";

export async function scrapeGreenhouse(company) {

  const baseUrl = `https://boards-api.greenhouse.io/v1/boards/${company}`;

  try {

    const res = await axios.get(`${baseUrl}/jobs`);

    // 🔥 LIMIT to avoid overload (increase later)
    const limitedJobs = res.data.jobs.slice(0, 20);

    // ⚡ PARALLEL FETCH (instead of slow loop)
    const jobs = await Promise.all(
      limitedJobs.map(async (job) => {

        try {

          const location = job.location?.name || "";

          // 🇮🇳 INDIA FILTER
          const isIndia =
            location.toLowerCase().includes("india") ||
            location.toLowerCase().includes("remote");

          if (!isIndia) return null;

          const detailRes = await axios.get(
            `${baseUrl}/jobs/${job.id}`,
            { timeout: 5000 }
          );

          const detail = detailRes.data;

          return {
            ...job,

            // keep your existing fields
            description: detail.content || "",
            location: location || "Remote",
            url: job.absolute_url
          };

        } catch (err) {
          console.log("Failed job:", job.title);
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