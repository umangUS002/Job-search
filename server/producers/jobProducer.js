import scraperQueue from "../queues/scraperQueue.js";

export const addCompanyToQueue = async (companySlug) => {

  const job = await scraperQueue.add("scrape-company", {
    companySlug
  });

  console.log("Job added:", job.id, companySlug);

};