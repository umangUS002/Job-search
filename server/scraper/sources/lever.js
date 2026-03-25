import axios from "axios";

export async function scrapeLever(company) {

  try {

    const url = `https://api.lever.co/v0/postings/${company}?mode=json`;

    const res = await axios.get(url, { timeout: 5000 });

    const jobs = res.data;

    const filtered = jobs
      .filter(job => {

        const location = job.categories?.location || "";

        const isIndia =
          location.toLowerCase().includes("india") ||
          location.toLowerCase().includes("remote");

        const isIntern =
          /intern|internship|trainee/i.test(job.text);

        return isIndia && isIntern;
      })
      .map(job => ({
        title: job.text,
        description: job.description || "",
        location: job.categories?.location || "Remote",
        url: job.hostedUrl,
        source: "lever"
      }));

    console.log(`Lever: ${company} → ${filtered.length} jobs`);

    return filtered;

  } catch (err) {

    console.log("Lever error:", company);
    return [];

  }
}