import { addCompanyToQueue } from "../producers/jobProducer.js";

const companies = ["datadog"];

const run = async () => {

  for (const company of companies) {

    await addCompanyToQueue(company);

  }

  console.log("All companies added to queue");

  process.exit();
};

run();