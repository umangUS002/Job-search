import InterviewSession from "../models/InterviewSession.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { startInterviewSession, submitCandidateAnswer } from "../services/interviewEngine.js";

// Start a new mock interview session
export const startInterview = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
    }

    // Fetch user and check resume
    const user = await User.findById(userId);
    if (!user || !user.resume || !user.resumeData) {
      return res.json({ success: false, message: "Please upload your resume in the Applications page before practicing." });
    }

    // Fetch job details
    const job = await Job.findById(jobId).populate("companyId", "name image");
    if (!job) {
      return res.json({ success: false, message: "Job not found." });
    }

    // Clear any existing in-progress session for this job and user to start fresh
    await InterviewSession.deleteMany({ userId, jobId, status: "in_progress" });

    // Call LangGraph engine to start the session and generate the first question
    const engineResult = await startInterviewSession({
      jobData: job,
      resumeData: user.resumeData,
      maxQuestions: 5,
      apiKey: process.env.GROQ_API_KEY
    });

    // Create session in database
    const session = new InterviewSession({
      userId,
      jobId,
      chatHistory: engineResult.chatHistory,
      currentQuestionIndex: engineResult.currentQuestionIndex,
      maxQuestions: 5,
      status: "in_progress"
    });

    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      nextQuestion: engineResult.nextQuestion,
      maxQuestions: session.maxQuestions,
      currentQuestionIndex: session.currentQuestionIndex
    });

  } catch (error) {
    console.error("Start interview error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Submit an answer to a question and get either the next question or the final report card
export const submitAnswer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
    }

    if (!answer || answer.trim() === "") {
      return res.json({ success: false, message: "Please provide a valid answer." });
    }

    // Find session
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.json({ success: false, message: "Interview session not found." });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden. Not your session." });
    }

    if (session.status === "completed") {
      return res.json({ success: true, isCompleted: true, report: session.report });
    }

    // Fetch user resume and job info
    const user = await User.findById(userId);
    const job = await Job.findById(session.jobId);

    // Call LangGraph engine to process response
    const engineResult = await submitCandidateAnswer({
      jobData: job,
      resumeData: user.resumeData,
      chatHistory: session.chatHistory,
      currentQuestionIndex: session.currentQuestionIndex,
      maxQuestions: session.maxQuestions,
      answer: answer.trim(),
      apiKey: process.env.GROQ_API_KEY
    });

    if (engineResult.isCompleted) {
      // Session finished, save the report card
      session.chatHistory = engineResult.chatHistory;
      session.status = "completed";
      session.report = engineResult.report;
      await session.save();

      res.json({
        success: true,
        isCompleted: true,
        report: session.report
      });
    } else {
      // Session continues, update history and index
      session.chatHistory = engineResult.chatHistory;
      session.currentQuestionIndex = engineResult.currentQuestionIndex;
      await session.save();

      res.json({
        success: true,
        isCompleted: false,
        nextQuestion: engineResult.nextQuestion,
        currentQuestionIndex: session.currentQuestionIndex
      });
    }

  } catch (error) {
    console.error("Submit answer error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
