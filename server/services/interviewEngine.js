import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";

// Helper: initialize ChatGroq
const getLLM = (apiKey) => {
  return new ChatGroq({
    apiKey: apiKey || process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
  });
};

// Define Graph State Structure
const stateChannels = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => []
  },
  jobData: { value: (x, y) => y || x, default: () => ({}) },
  resumeData: { value: (x, y) => y || x, default: () => ({}) },
  currentQuestionIndex: { value: (x, y) => y !== undefined ? y : x, default: () => 0 },
  maxQuestions: { value: (x, y) => y || x, default: () => 5 },
  nextQuestion: { value: (x, y) => y || x, default: () => "" },
  isCompleted: { value: (x, y) => y !== undefined ? y : x, default: () => false },
  report: { value: (x, y) => y || x, default: () => null },
  apiKey: { value: (x, y) => y || x, default: () => "" }
};

// Node 1: Generate next question
const generateQuestionNode = async (state) => {
  const model = getLLM(state.apiKey);
  
  const historyText = state.messages
    .map(msg => `${msg.role === "assistant" ? "Interviewer" : "Candidate"}: ${msg.content}`)
    .join("\n");

  const prompt = `
You are an expert technical interviewer. You are conducting a structured mock interview with a candidate.

Job Details:
Title: ${state.jobData.title}
Description: ${state.jobData.description}
Skills: ${JSON.stringify(state.jobData.skills || [])}

Candidate Resume Details:
${JSON.stringify(state.resumeData)}

Conversation History so far:
${historyText || "No history yet. This is the start of the interview."}

Current Question Number: ${state.currentQuestionIndex + 1} of ${state.maxQuestions}

Your Task:
Based on the job requirements, the candidate's background, and what has already been discussed, generate the next single interview question.
- Do NOT add greeting or conversational fluff, just output the question directly.
- The question should be challenging and highly relevant.
- Do NOT evaluate the candidate's previous answer in this output; just ask the next question.
`;

  const response = await model.invoke([
    new SystemMessage("You are a professional technical interviewer. Ask exactly one question directly without conversational fluff."),
    new HumanMessage(prompt)
  ]);

  return {
    nextQuestion: response.content.trim(),
    messages: [{ role: "assistant", content: response.content.trim() }]
  };
};

// Node 2: Compile final evaluation report
const compileReportNode = async (state) => {
  const model = new ChatGroq({
    apiKey: state.apiKey || process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    responseFormat: { type: "json_object" }
  });

  const historyText = state.messages
    .map(msg => `${msg.role === "assistant" ? "Interviewer" : "Candidate"}: ${msg.content}`)
    .join("\n");

  const prompt = `
You are an expert technical recruiter and interviewer evaluator. Analyze the transcript of the mock interview and generate a detailed report.

Job Details:
Title: ${state.jobData.title}
Description: ${state.jobData.description}

Candidate Resume:
${JSON.stringify(state.resumeData)}

Interview Transcript:
${historyText}

Compute and return a structured report in JSON format containing:
1. overallScore: A number from 0 to 100 representing how well the candidate answered questions and fits the role.
2. feedbackSummary: A 2-sentence summary of the candidate's overall performance.
3. strengths: An array of 2-3 key strengths demonstrated in their answers.
4. weaknesses: An array of 2-3 areas of improvement or gaps identified in their answers.
5. suggestedAnswers: An array of objects, one for each question asked by the interviewer in the transcript. Each object must have:
   - question: The question that was asked.
   - suggestions: A concise explanation of what a perfect answer should have included.

Strictly return ONLY a valid JSON object matching this structure:
{
  "overallScore": 85,
  "feedbackSummary": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "suggestedAnswers": [
    {
      "question": "...",
      "suggestions": "..."
    }
  ]
}
`;

  const response = await model.invoke([
    new SystemMessage("You are an expert recruiter returning JSON feedback. Return ONLY raw JSON, do not wrap in markdown backticks."),
    new HumanMessage(prompt)
  ]);

  const reportData = JSON.parse(response.content);

  return {
    report: reportData,
    isCompleted: true
  };
};

// Node 3: Decide next step
const routerEdge = (state) => {
  if (state.currentQuestionIndex >= state.maxQuestions) {
    return "compile_report";
  }
  return "generate_question";
};

// Build the workflow graph
const workflow = new StateGraph({ channels: stateChannels })
  .addNode("generate_question", generateQuestionNode)
  .addNode("compile_report", compileReportNode)
  .addEdge("__start__", "generate_question") // default starting point
  .addEdge("generate_question", "compile_report")
  .addEdge("compile_report", "__end__");

// Compile the graph
const interviewGraph = workflow.compile();

/**
 * Starts an interview and returns the first question
 */
export async function startInterviewSession({ jobData, resumeData, maxQuestions, apiKey }) {
  const initialState = {
    jobData,
    resumeData,
    maxQuestions: maxQuestions || 5,
    currentQuestionIndex: 0,
    messages: [],
    apiKey
  };

  const result = await interviewGraph.invoke(initialState);
  return {
    nextQuestion: result.nextQuestion,
    chatHistory: result.messages,
    currentQuestionIndex: 1
  };
}

/**
 * Handles a candidate's response, increments step, and either gets next question or compiles report
 */
export async function submitCandidateAnswer({ jobData, resumeData, chatHistory, currentQuestionIndex, maxQuestions, answer, apiKey }) {
  // Add candidate's answer to the messages list
  const stateMessages = [
    ...chatHistory,
    { role: "user", content: answer }
  ];

  const nextIndex = currentQuestionIndex; // currentQuestionIndex was 1-based, we are evaluating answer to Q1

  // Create state to run
  const runState = {
    jobData,
    resumeData,
    maxQuestions,
    currentQuestionIndex: nextIndex,
    messages: stateMessages,
    apiKey
  };

  // Run the router edge logic manually or invoke specific nodes
  const nextNode = routerEdge(runState);

  if (nextNode === "compile_report") {
    // Run evaluation report compiler
    const result = await compileReportNode(runState);
    return {
      isCompleted: true,
      chatHistory: stateMessages,
      report: result.report
    };
  } else {
    // Run next question generator node
    const result = await generateQuestionNode(runState);
    return {
      isCompleted: false,
      nextQuestion: result.nextQuestion,
      chatHistory: [...stateMessages, { role: "assistant", content: result.nextQuestion }],
      currentQuestionIndex: nextIndex + 1
    };
  }
}
