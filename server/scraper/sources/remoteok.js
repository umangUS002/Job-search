import axios from "axios";
import { isEngineeringAndJuniorJob } from "../utils/parser.js";

export async function scrapeRemoteOK() {
  try {
    const url = "https://remoteok.com/api";
    const res = await axios.get(url, {
      timeout: 6500,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });

    const postings = res.data;
    if (!Array.isArray(postings)) return [];

    // The first item in RemoteOK is a meta description, slice it out
    const jobs = postings.slice(1);

    // Filter to keep only India region jobs
    const filteredJobs = jobs.filter(job => {
      const loc = (job.location || "").toLowerCase();
      const title = (job.position || "").toLowerCase();
      const desc = (job.description || "").toLowerCase();
      
      const otherCountries = ["us", "united states", "usa", "uk", "united kingdom", "canada", "europe", "americas", "latam", "germany", "france", "australia"];
      const hasOtherCountry = otherCountries.some(c => loc.includes(c));
      
      const isIndiaRegion = loc.includes("india") || 
                            desc.includes("india") || 
                            title.includes("india");
                              
      return isIndiaRegion && (!hasOtherCountry || loc.includes("india")) && isEngineeringAndJuniorJob(job.position);
    });

    console.log(`RemoteOK: Filtered to ${filteredJobs.length} India-region junior tech jobs from ${jobs.length} postings`);

    return filteredJobs.map(job => {
      const salaryMin = job.salary_min || 0;
      const salaryMax = job.salary_max || 0;
      const salaryVal = salaryMax > 0 ? salaryMax : salaryMin;

      // Extract details
      return {
        title: job.position,
        description: job.description || "",
        location: "Remote",
        url: job.apply_url || job.url,
        companyName: job.company || "Remote Company",
        salary: salaryVal > 0 ? salaryVal : undefined,
        level: "Mid",
        source: "remoteok"
      };
    });
  } catch (err) {
    console.log("RemoteOK error:", err.message);
    return [];
  }
}
