import { esClient } from "../configs/elasticSearch.js";
import Job from "../models/Job.js"
import User from "../models/User.js"
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { analyzeJobLocally } from "../utils/localJobAnalyzer.js"


// Get all jobs
export const getJobs = async (req, res) => {
    try {
        const { userId } = await req.auth();
        let jobs = await Job.find({ visible: true }).
            populate({ path: 'companyId', select: '-password' })

        // 🔒 Anonymous Limit
        if (!userId) {
            jobs = jobs.slice(0, 15);
        }

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

    const { keyword, location, skill, resumeMatch } = req.query;
    const { userId } = await req.auth();

    let jobs = [];
    let isEsSuccessful = false;

    // Check if we should use ES (if ES parameters are active)
    if (keyword || location || skill) {
      try {
        let must = [];
        if (keyword) {
          must.push({
            multi_match: {
              query: keyword,
              fields: ["title^2", "description"],
              fuzziness: "AUTO"
            }
          });
        }
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

        const response = await esClient.search({
          index: "jobs",
          query: {
            bool: { must }
          },
          size: 50
        });

        const hits = response.hits.hits;
        const identifiers = hits.map(hit => hit._id);

        if (identifiers.length > 0) {
          // Fetch from MongoDB matching these ids or urls
          const mongoJobs = await Job.find({
            $or: [
              { url: { $in: identifiers } },
              { _id: { $in: identifiers.filter(id => id.match(/^[0-9a-fA-F]{24}$/)) } }
            ]
          }).populate("companyId");

          // Sort Mongoose jobs according to the rank order returned by Elasticsearch
          const jobMap = new Map();
          mongoJobs.forEach(job => {
            if (job.url) jobMap.set(job.url, job);
            jobMap.set(job._id.toString(), job);
          });

          jobs = identifiers
            .map(id => jobMap.get(id))
            .filter(Boolean); // remove nulls
          
          isEsSuccessful = true;
          console.log(`🔍 ES search returned ${jobs.length} fuzzy matched jobs`);
        } else {
          jobs = [];
          isEsSuccessful = true;
        }
      } catch (esErr) {
        console.warn("⚠️ ES search failed, falling back to MongoDB regex search:", esErr.message);
      }
    }

    // Fallback to MongoDB regex search if ES not used or failed
    if (!isEsSuccessful) {
      let query = {};
      if (keyword) {
        query.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { company: { $regex: keyword, $options: "i" } },
          { skills: { $regex: keyword, $options: "i" } }
        ];
      }
      if (location) {
        query.location = { $regex: location, $options: "i" };
      }
      if (skill) {
        query.skills = { $regex: skill, $options: "i" };
      }

      jobs = await Job.find(query)
        .populate("companyId")
        .sort({ createdAt: -1 });
    }

    // Handle Resume Specific Search Sorting & Filtering
    if (resumeMatch === "true" && userId) {
      const user = await User.findById(userId);
      if (user && user.resumeData) {
        jobs = jobs.map(job => {
          const analysis = analyzeJobLocally(user.resumeData, job);
          return {
            ...job.toObject(),
            matchScore: analysis.matchScore
          };
        })
        .filter(job => job.matchScore >= 50)
        .sort((a, b) => b.matchScore - a.matchScore);
      }
    }

    // 🔒 Anonymous Limit
    if (!userId) {
      jobs = jobs.slice(0, 15);
    }

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

// AI Resume Matching and Analysis
export const analyzeJobMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.json({ success: false, message: "Job not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if user has uploaded a resume and has parsed resume data
    if (!user.resume || !user.resumeData) {
      return res.json({ success: true, hasResume: false });
    }

    let analysis = null;

    // Use Groq if key is available
    if (process.env.GROQ_API_KEY) {
      try {
        const model = new ChatGroq({
          apiKey: process.env.GROQ_API_KEY,
          model: "llama-3.3-70b-versatile",
          responseFormat: { type: "json_object" }
        });
        const prompt = `
You are an expert technical recruiter and ATS assistant. Analyze the match between the candidate's parsed resume and the job description.

Candidate Resume Data:
${JSON.stringify(user.resumeData)}

Job Details:
Title: ${job.title}
Skills Required: ${JSON.stringify(job.skills || [])}
Description: ${job.description}

Compute:
1. matchScore: A number from 0 to 100 representing how well the candidate's skills, experience, and projects fit the job description.
2. atsScore: A number from 0 to 100 representing the candidate's formatting and keyword density strength relative to standard ATS systems.
3. missingSkills: An array of strings representing key skills, programming languages, tools, or concepts explicitly required or mentioned in the job description that are NOT found in the candidate's resume skills or description text.
4. summary: A concise 2-sentence summary of what this job is about.
5. skillGapAnalysis: A short feedback note on how the candidate can bridge the gap (e.g. what specific projects or tools to learn).

Strictly return ONLY a valid JSON object matching this structure:
{
  "matchScore": 85,
  "atsScore": 78,
  "missingSkills": ["Docker", "TypeScript"],
  "summary": "...",
  "skillGapAnalysis": "..."
}
        `;

        const response = await model.invoke([
          new SystemMessage("You are a professional AI recruiter returning JSON results. Return ONLY raw JSON, do not wrap in markdown backticks."),
          new HumanMessage(prompt)
        ]);

        analysis = JSON.parse(response.content);
      } catch (err) {
        console.log("Groq job analysis failed:", err.message);
      }
    }

    // Fallback if Groq is not configured or failed
    if (!analysis) {
      console.log("Using local fallback job analyzer...");
      analysis = analyzeJobLocally(user.resumeData, job);
    }

    res.json({ success: true, hasResume: true, analysis });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Generate tailored cover letter using LangChain ChatGroq
export const generateCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
    }

    const user = await User.findById(userId);
    if (!user || !user.resume || !user.resumeData) {
      return res.json({ success: false, message: "Please upload your resume first." });
    }

    const job = await Job.findById(id).populate("companyId", "name");
    if (!job) {
      return res.json({ success: false, message: "Job not found." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.json({ success: false, message: "Groq API key not configured on server." });
    }

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile"
    });

    const prompt = `
You are an expert career consultant and technical writer. Write a professional, highly tailored cover letter for the candidate applying to the specified job role.

Candidate Name: ${user.name}
Candidate Email: ${user.email}

Candidate Resume Details:
${JSON.stringify(user.resumeData)}

Job Details:
Title: ${job.title}
Company: ${job.companyId?.name || "Company"}
Description: ${job.description}

Write a cover letter that is:
1. Formatted in clean markdown (MD).
2. Keeps to 3-4 paragraphs.
3. Highlights matching projects, skills, and experiences directly relevant to the job.
4. Professional, encouraging, and clear.
5. Do NOT include placeholders (e.g. [Date] or [Company Address]) that look generic. Format it directly as a ready-to-use letter.
`;

    const response = await model.invoke([
      new SystemMessage("You are an expert career advisor. Write a professional, highly tailored cover letter in clean markdown without any conversational intro/outro or placeholder details."),
      new HumanMessage(prompt)
    ]);

    res.json({ success: true, coverLetter: response.content });

  } catch (error) {
    console.error("Cover letter generation error:", error.message);
    res.json({ success: false, message: error.message });
  }
};