import { esClient } from "../configs/elasticSearch.js";

async function createIndex() {

  const exists = await esClient.indices.exists({ index: "jobs" });

  if (!exists) {

    await esClient.indices.create({
      index: "jobs",
      mappings: {
        properties: {
          title: { type: "text" },
          description: { type: "text" },
          location: { type: "text" },
          company: { type: "keyword" },
          skills: { type: "keyword" },
          level: { type: "keyword" }
        }
      }
    });

    console.log("✅ jobs index created");

  } else {
    console.log("⚠️ index already exists");
  }
}

createIndex();