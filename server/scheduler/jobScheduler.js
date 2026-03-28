import cron from "node-cron";
import { addCompanyToQueue } from "../producers/jobProducer.js";

const companies = ["airbnb", "stripe", "notion", "datadog", "coinbase"];

cron.schedule("0 2 * * *", async () => {

  console.log("⏰ Running at 2 AM");

  try {

    await Promise.all(
      companies.map(company => addCompanyToQueue(company))
    );

    console.log("✅ Jobs added to queue");

  } catch (err) {
    console.log("❌ Scheduler error:", err.message);
  }

});