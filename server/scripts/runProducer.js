import { addCompanyToQueue } from "../producers/jobProducer.js";
import { discoverGreenhouseCompanies } from "../scraper/utils/discoverCompanies.js";

const run = async () => {

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