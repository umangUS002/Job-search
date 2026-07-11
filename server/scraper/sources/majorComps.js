import axios from 'axios';

export async function scrapeMajorComps() {
  const jobs = [];

  // 1. Live Google Careers Scraper
  try {
    console.log("Google Careers: Fetching live listings...");
    const url = "https://careers.google.com/jobs/results/?q=software&location=India";
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 10000
    });

    const html = res.data;
    const startIdx = html.indexOf("AF_initDataCallback({key: 'ds:1'");
    if (startIdx !== -1) {
      const dataPropertyStart = html.indexOf("data:", startIdx);
      const arrayStart = html.indexOf("[", dataPropertyStart);
      let bracketCount = 0;
      let arrayEnd = -1;

      for (let i = arrayStart; i < html.length; i++) {
        if (html[i] === '[') bracketCount++;
        else if (html[i] === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            arrayEnd = i;
            break;
          }
        }
      }

      if (arrayEnd !== -1) {
        const jsonText = html.substring(arrayStart, arrayEnd + 1);
        const data = JSON.parse(jsonText);
        const jobList = data[0] || [];

        console.log(`Google Careers: Scraped ${jobList.length} raw jobs`);

        for (const job of jobList) {
          try {
            const id = job[0];
            const title = job[1];
            const applyUrl = job[2];
            const descHtml = job[3]?.[1] || "";
            const qualHtml = job[4]?.[1] || "";
            const company = job[7] || "Google";
            
            // Location
            const locs = job[9] || [];
            const locationName = locs[0]?.[0] || "Bengaluru, India";

            // Clean descriptions
            const description = (descHtml + "\n" + qualHtml)
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            jobs.push({
              title,
              description: description || "Explore SDE positions at Google.",
              location: locationName,
              url: applyUrl || `https://careers.google.com/jobs/results/${id}/`,
              companyName: company,
              salary: title.toLowerCase().includes("intern") ? 1000000 : 1800000, 
              level: title.toLowerCase().includes("intern") ? "Intern" : "Junior",
              source: "major-comps"
            });
          } catch (err) {
            // Ignore single job parse error
          }
        }
      }
    }
  } catch (error) {
    console.log("Google Careers scrape failed:", error.message);
  }

  // 2. Add live links for other major giants to avoid expired 404 links
  jobs.push(
    {
      title: "Software Engineer / Technical Lead / Manager Roles",
      description: "Explore all active software engineering, developer, and technical leadership opportunities at Microsoft India. Clicking Apply will take you directly to Microsoft's live search portal for SDE jobs in India.",
      location: "Bengaluru / Hyderabad / Noida, India",
      url: "https://careers.microsoft.com/us/en/search-results?keywords=software&location=India",
      companyName: "Microsoft",
      salary: 2200000,
      level: "Junior",
      source: "major-comps"
    },
    {
      title: "Associate / Senior Software Engineer Openings",
      description: "Explore all active software developer, front-end, back-end, and full-stack positions at Atlassian India. Clicking Apply will take you directly to Atlassian's live career search portal for India openings.",
      location: "Bengaluru, Karnataka, India",
      url: "https://www.atlassian.com/company/careers/all-jobs?location=India",
      companyName: "Atlassian",
      salary: 1600000,
      level: "Junior",
      source: "major-comps"
    },
    {
      title: "Software Engineering & Production Roles",
      description: "Explore all active technical university graduate, software developer, and system engineering positions at Meta (Facebook). Clicking Apply will take you directly to Meta's live careers portal for software roles in India.",
      location: "Remote / Gurgaon, India",
      url: "https://www.metacareers.com/jobs/?q=software&location=India",
      companyName: "Meta",
      salary: 2600000,
      level: "Junior",
      source: "major-comps"
    },
    {
      title: "Software Engineer & Core Infrastructure Roles",
      description: "Explore all active software engineer, new graduate, and platform infrastructure roles at Netflix. Clicking Apply will take you directly to Netflix's live search portal.",
      location: "Remote / Mumbai, India",
      url: "https://jobs.netflix.com/search?q=software",
      companyName: "Netflix",
      salary: 3200000,
      level: "Junior",
      source: "major-comps"
    },
    {
      title: "Program Associate / Software Developer Roles",
      description: "Explore all active technology associate, software engineer, and database developer listings at Wells Fargo India. Clicking Apply will take you directly to Wells Fargo's live careers portal.",
      location: "Bengaluru / Hyderabad, India",
      url: "https://www.wellsfargojobs.com/en/jobs/?search=software&location=India",
      companyName: "Wells Fargo",
      salary: 1200000,
      level: "Junior",
      source: "major-comps"
    }
  );

  return jobs;
}
