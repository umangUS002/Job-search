import mongoose from "mongoose";

const InterviewSessionSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    chatHistory: [{
        role: { type: String, enum: ['assistant', 'user'], required: true },
        content: { type: String, required: true }
    }],
    currentQuestionIndex: { type: Number, default: 0 },
    maxQuestions: { type: Number, default: 5 },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    report: {
        overallScore: Number,
        feedbackSummary: String,
        strengths: [String],
        weaknesses: [String],
        suggestedAnswers: [{
            question: String,
            suggestions: String
        }]
    },
    date: { type: Number, default: () => Date.now() }
});

const InterviewSession = mongoose.model('InterviewSession', InterviewSessionSchema);

export default InterviewSession;
