import { addCompanyToQueue } from "../producers/jobProducer.js";
import { discoverGreenhouseCompanies } from "../scraper/utils/discoverCompanies.js";
import connectDB from "../configs/db.js";
import Job from "../models/Job.js";

const run = async () => {
  await connectDB();
  console.log("🧹 Clearing old jobs from database...");
  await Job.deleteMany({});
  console.log("✨ Database cleared.");

  const companies = await discoverGreenhouseCompanies();

  console.log("Discovered companies:", companies.length);

  // ⚡ Add all to queue
  await Promise.all(
    companies.map(company => addCompanyToQueue(company))
  );

  console.log("All companies added to queue");

  process.exit();
};

run();