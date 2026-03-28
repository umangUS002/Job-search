import { esClient } from "../configs/elasticSearch.js";
import Job from "../models/Job.js"


// Get all jobs
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ visible: true }).
            populate({ path: 'companyId', select: '-password' })

        res.json({ success: true, jobs });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get a single job by id
export const getJobById = async (req, res) => {
    try {

        const { id } = req.params
        const job = await Job.findById(id)
            .populate({
                path: 'companyId',
                select: '-password'
            })

        if (!job) {
            return res.json({ success: false, message: 'Job Not Found' });
        }

        res.json({ success: true, job });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Save scrapped jobs
export const saveScrapedJobs = async (req, res) => {
    try {

        const existing = await Job.findOne({ link: req.body.link });

        if (existing) {
            return res.status(200).json({ message: "Job already exists" });
        }

        const job = new Job(req.body);
        await job.save();

        res.status(201).json(job);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Filter jobs
export const filterJobs = async (req, res) => {
  try {

    const { keyword, location, skill } = req.query;

    let query = {};

    // 🔍 keyword search
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    // 📍 location
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // 🧠 skill filter
    if (skill) {
      query.skills = { $regex: skill, $options: "i" };
    }

    const jobs = await Job.find(query)
      .populate("companyId")
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Elastic Search
export const searchJobsES = async (req, res) => {
  try {
    const { keyword, location, skill } = req.query;

    let must = [];

    // 🔍 keyword
    if (keyword) {
      must.push({
        multi_match: {
          query: keyword,
          fields: ["title^2", "description"],
          fuzziness: "AUTO"
        }
      });
    }

    // 📍 location
    if (location) {
      must.push({
        match: {
          location: {
            query: location,
            fuzziness: "AUTO"
          }
        }
      });
    }

    // 🧠 skill
    if (skill) {
      must.push({
        match: {
          skills: {
            query: skill,
            fuzziness: "AUTO"
          }
        }
      });
    }

    // ⭐ IMPORTANT FIX
    if (must.length === 0) {
      must.push({ match_all: {} });
    }

    const response = await esClient.search({
      index: "jobs",
      query: {
        bool: { must }
      }
    });

    const jobs = response.hits.hits.map(hit => hit._source);

    res.json({ success: true, jobs });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};