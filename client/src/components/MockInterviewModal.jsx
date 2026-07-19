import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import gsap from 'gsap';

function MockInterviewModal({ jobId, jobTitle, companyName, onClose }) {
  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [maxQuestions, setMaxQuestions] = useState(5);
  
  // Completion states
  const [isCompleted, setIsCompleted] = useState(false);
  const [report, setReport] = useState(null);

  const modalRef = useRef(null);
  const chatEndRef = useRef(null);

  // Entrance animation
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    gsap.fromTo(modalRef.current,
      { scale: 0.9, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' }
    );

    // Start the interview session on mount
    initiateSession();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const initiateSession = async () => {
    try {
      setStarting(true);
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/interviews/start`,
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setSessionId(data.sessionId);
        setCurrentQuestionIndex(data.currentQuestionIndex);
        setMaxQuestions(data.maxQuestions);
        setMessages([{ role: 'assistant', content: data.nextQuestion }]);
      } else {
        toast.error(data.message);
        onClose();
      }
    } catch (error) {
      toast.error('Failed to initiate mock interview: ' + error.message);
      onClose();
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading || starting) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    
    // Optimistically push user message
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/interviews/answer`,
        { sessionId, answer: userText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        if (data.isCompleted) {
          setIsCompleted(true);
          setReport(data.report);
        } else {
          setCurrentQuestionIndex(data.currentQuestionIndex);
          setMessages((prev) => [...prev, { role: 'assistant', content: data.nextQuestion }]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to submit response: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-slate-900/55 flex justify-center items-center p-4 transition-all duration-300">
      <div 
        ref={modalRef}
        className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl text-slate-700 max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden transform origin-center"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/20">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-1.5">
              <span className="p-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm">🎙️</span>
              Mock Interview Practice
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {jobTitle} at {companyName || 'Company'}
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-650"
          >
            ✕
          </button>
        </div>

        {/* Practice Body */}
        {starting ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-semibold">Generating your first interview question...</p>
          </div>
        ) : !isCompleted ? (
          // --- Chat Interface ---
          <>
            {/* Progress indicator */}
            <div className="bg-indigo-50/40 px-6 py-2 border-b border-indigo-100/30 flex justify-between items-center text-xs font-bold text-indigo-700">
              <span>Question {currentQuestionIndex} of {maxQuestions}</span>
              <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(currentQuestionIndex / maxQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Chat message list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm font-medium leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-550 text-white rounded-br-none' 
                        : 'bg-white border border-slate-100 text-slate-750 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-semibold">AI is analyzing your answer...</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2.5 bg-white">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your answer here..."
                disabled={loading}
                className="flex-1 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-2xl px-5 py-3 text-sm font-medium transition-all"
                required
              />
              <button 
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-2xl transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          // --- Report Card View ---
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center py-4 bg-indigo-50/20 border border-indigo-100/35 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <h4 className="text-sm font-extrabold text-indigo-700 tracking-wide uppercase">Mock Interview Completed!</h4>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Here is your detailed AI Evaluation report.</p>

              {/* Large Ring Gauge */}
              <div className="mt-5 flex justify-center">
                <div className="relative w-28 h-28 flex flex-col items-center justify-center rounded-full bg-white border-4 border-indigo-500 shadow-md">
                  <span className="text-3xl font-black text-indigo-700 leading-none">{report.overallScore}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Overall Fit</span>
                </div>
              </div>
            </div>

            {/* Feedback Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Summary</h4>
              <p className="text-sm text-slate-650 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-2xl font-medium">
                {report.feedbackSummary}
              </p>
            </div>

            {/* Strengths & Weaknesses Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Key Strengths</h4>
                <ul className="bg-emerald-50/20 border border-emerald-100/40 p-4 rounded-2xl space-y-2.5 text-xs text-slate-700 font-medium">
                  {report.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider">Areas to Improve</h4>
                <ul className="bg-amber-50/20 border border-amber-100/40 p-4 rounded-2xl space-y-2.5 text-xs text-slate-700 font-medium">
                  {report.weaknesses?.map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">⚠</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question Suggestions / Guide */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions & Suggested Perfect Answers</h4>
              
              <div className="space-y-3">
                {report.suggestedAnswers?.map((item, idx) => (
                  <details key={idx} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <summary className="px-5 py-4 font-bold text-sm text-slate-750 hover:bg-slate-50/50 cursor-pointer flex justify-between items-center transition-colors">
                      <span className="flex-1 pr-4">Q{idx + 1}: {item.question}</span>
                      <span className="text-xs text-indigo-500 font-black transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 border-t border-slate-50/50 leading-relaxed font-medium">
                      <p className="font-bold text-indigo-750 mb-1">AI Recommendation:</p>
                      {item.suggestions}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Close / Action Panel */}
            <div className="pt-2 text-center">
              <button 
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-2xl shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all cursor-pointer"
              >
                Done Practice Session
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MockInterviewModal;
