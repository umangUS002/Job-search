import cron from "node-cron";
import { addCompanyToQueue } from "../producers/jobProducer.js";

const companies = ["zomato", "myntra", "swiggy", "slice", "jupiter", "cred", "coinswitchkuber", "browserstack", "chargebee", "freshworks", "licious", "dunzo", "shiprocket", "gleanwork", "observeai", "whatfix", "agoda", "atlassian", "acko", "urbancompany", "postman", "razorpay", "phonepe", "groww", "inmobi", "tekion", "zscaler", "atlan", "hasura", "sigmoid", "alphasense", "airbnb", "stripe", "notion", "datadog", "coinbase", "databricks", "cloudfare"];

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