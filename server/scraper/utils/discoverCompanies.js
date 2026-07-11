import axios from "axios";

export async function discoverGreenhouseCompanies() {

  try {

    // 🔥 Known seed companies (expand later)
    const seeds = [
      "phonepe",
      "groww",
      "inmobi",
      "hasura",
      "postman",
      "tekion",
      "zscaler",
      "slice",
      "cred",
      "agoda",
      "airbnb",
      "stripe",
      "notion",
      "datadog",
      "coinbase",
      "remoteok",

      "razorpay",
      "browserstack",
      "chargebee",
      "freshworks",
      "whatfix",
      "devrev",
      "rocketlane",
      "observeai",
      "sarvamai",
      "krutrim",
      "hyperverge",
      "moengage",
      "cashfree",
      "smallcase",
      "open",
      "fi",
      "jupiter",
      "zepto"
    ];

    return seeds;

  } catch (err) {
    return [];
  }
}