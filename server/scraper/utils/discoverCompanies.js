import axios from "axios";

export async function discoverGreenhouseCompanies() {

  try {

    // 🔥 Known seed companies (expand later)
    const seeds = [
      "airbnb",
      "stripe",
      "notion",
      "datadog",
      "coinbase",
      "robinhood"
    ];

    return seeds;

  } catch (err) {
    return [];
  }
}