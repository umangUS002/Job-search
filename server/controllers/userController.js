import JobApplication from "../models/JobApplications.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';
import Job from "../models/Job.js";
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { parseResumeLocally } from '../utils/localResumeParser.js';

// Get user data
export const getUserData = async(req, res) => {

    const { userId } = await req.auth();

    try {
        
        const user = await User.findById(userId);

        if(!user){
            return res.json({success: false, message: 'User Not Found'});
        }

        res.json({success: true, user});

    } catch (error) {
        res.json({success: false, message: error.message});
    }

}

// Apply for a job
export const applyForJob = async(req, res) => {

    const { jobId } = req.body;
    const { userId } = await req.auth();

    try {
        const isAlreadyApplied = await JobApplication.find({jobId, userId});

        if (isAlreadyApplied.length > 0) {
            return res.json({success: false, message: 'Already Applied'});
        }

        const jobData = await Job.findById(jobId);

        if (!jobData) {
            return res.json({success: false, message: 'Job Not Found'})
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        })

        res.json({success: true, message: 'Applied Successfully'});

    } catch (error) {
        res.json({success: false, message: error.message });
    }

}

// Get applied jobs of user
export const getUserJobApplications = async(req, res) => {
    try {

        const { userId } = await req.auth();
        const applications = await JobApplication.find({ userId })
        .populate('companyId', 'name email image')
        .populate('jobId', 'title description location category level salary')
        .exec()

        if(!applications){
            return res.json({success: false, message: 'No Job Applications Found'});
        }

        return res.json({success: true, applications});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Update user profile (resume only)
export const updateUserResume = async(req, res) => {

    try {
        
        const { userId } = await req.auth();
        const resumeFile = req.file;
        const userData = await User.findById(userId);

        if(resumeFile){
            // Upload to Cloudinary
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path);
            userData.resume = resumeUpload.secure_url;

            // Extract text from PDF locally
            let resumeText = "";
            try {
                const pdfBuffer = fs.readFileSync(resumeFile.path);
                const pdfData = await pdfParse(pdfBuffer);
                resumeText = pdfData.text || "";
            } catch (pdfErr) {
                console.log("PDF parse error:", pdfErr.message);
            }

            // Parse text using Groq or Fallback
            let parsedData = null;
            if (resumeText && process.env.GROQ_API_KEY) {
                try {
                    const model = new ChatGroq({
                        apiKey: process.env.GROQ_API_KEY,
                        model: "llama-3.3-70b-versatile",
                        responseFormat: { type: "json_object" }
                    });
                    const response = await model.invoke([
                        new SystemMessage("You are an expert ATS resume parsing assistant. Parse the resume details accurately. Return ONLY valid JSON matching the specified structure without markdown formatting or backticks."),
                        new HumanMessage(`Extract the following details from this resume text:
1. skills (array of lowercase tech/programming tools, frameworks, and languages)
2. projects (array of objects with: title, description)
3. education (array of objects with: degree, school, year)
4. experience (array of objects with: role, company, duration)

Strictly return ONLY this JSON structure:
{
  "skills": ["react", "node", ...],
  "projects": [{"title": "...", "description": "..."}],
  "education": [{"degree": "...", "school": "...", "year": "..."}],
  "experience": [{"role": "...", "company": "...", "duration": "..."}]
}

Resume Text:
${resumeText}`)
                    ]);

                    parsedData = JSON.parse(response.content);
                } catch (llmErr) {
                    console.log("Groq resume parsing failed:", llmErr.message);
                }
            }

            // If Groq is missing or failed, run local fallback
            if (!parsedData) {
                console.log("Running local fallback resume parser...");
                parsedData = parseResumeLocally(resumeText);
            }

            userData.resumeData = parsedData;
        }

        await userData.save();
        return res.json({success: true, message: 'Resume Updated'});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }

}