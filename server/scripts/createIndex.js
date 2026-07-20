import { esClient } from "../configs/elasticSearch.js";
import connectDB from "../configs/db.js";
import Job from "../models/Job.js";

export async function createAndSyncIndex() {
  try {
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

    // Connect to DB and sync jobs
    await connectDB();
    const jobs = await Job.find({}).populate("companyId", "name");
    console.log(`🔄 Syncing ${jobs.length} jobs to Elasticsearch...`);

    if (jobs.length > 0) {
      const operations = jobs.flatMap(job => {
        const companyName = job.companyId?.name || job.company || "Company";
        return [
          { index: { _index: "jobs", _id: job.url || job._id.toString() } },
          {
            title: job.title,
            description: job.description || "",
            location: job.location || "Remote",
            company: companyName,
            skills: job.skills || [],
            level: job.level || "Not specified"
          }
        ];
      });

      const bulkResponse = await esClient.bulk({ refresh: true, operations });
      if (bulkResponse.errors) {
        console.log("❌ Bulk sync encountered errors");
      } else {
        console.log(`✅ Successfully synced ${jobs.length} jobs to Elasticsearch.`);
      }
    }
  } catch (err) {
    console.error("❌ createAndSyncIndex error:", err.message);
  }
}

// Run directly if called via command line
if (process.argv[1] && (process.argv[1].endsWith('createIndex.js') || process.argv[1].endsWith('createIndex'))) {
  createAndSyncIndex().then(() => {
    console.log("✨ Done index setup.");
    process.exit(0);
  });
}