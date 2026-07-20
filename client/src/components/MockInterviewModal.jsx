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

  // Audio / Speech states
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

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
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech (TTS) logic
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        speakText(lastMsg.content);
      }
    }
  }, [messages, isMuted]);

  // Speech-To-Text (STT) logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        if (e.error !== 'no-speech') {
          toast.error("Voice input error: " + e.error);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.warning("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current.start();
    }
  };

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
        className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-2xl text-slate-700 dark:text-slate-200 max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden transform origin-center"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-indigo-50/20 dark:bg-indigo-950/20">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-105 flex items-center gap-1.5">
              <span className="p-1 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm">🎙️</span>
              Mock Interview Practice
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {jobTitle} at {companyName || 'Company'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const newMute = !isMuted;
                setIsMuted(newMute);
                if (newMute && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-550 dark:text-slate-300 text-sm"
              title={isMuted ? "Unmute Interviewer" : "Mute Interviewer"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-400 dark:text-slate-550 hover:text-slate-650 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Practice Body */}
        {starting ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-205 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Generating your first interview question...</p>
          </div>
        ) : !isCompleted ? (
          // --- Chat Interface ---
          <>
            {/* Progress indicator */}
            <div className="bg-indigo-50/40 dark:bg-indigo-950/10 px-6 py-2 border-b border-indigo-100/30 dark:border-indigo-900/40 flex justify-between items-center text-xs font-bold text-indigo-755 dark:text-indigo-400">
              <span>Question {currentQuestionIndex} of {maxQuestions}</span>
              <div className="w-32 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(currentQuestionIndex / maxQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Chat message list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/10">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm font-medium leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-550 text-white rounded-br-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 text-slate-750 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 dark:text-slate-550 font-semibold">AI is analyzing your answer...</span>
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
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5 bg-white dark:bg-slate-900">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isListening ? "Listening... Speak now..." : "Type or speak your answer here..."}
                  disabled={loading}
                  className="flex-1 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-2xl pl-5 pr-12 py-3 text-sm font-medium transition-all text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950/40"
                  required
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={loading}
                  className={`absolute right-3.5 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                  title={isListening ? "Stop Listening" : "Speak Answer"}
                >
                  🎙️
                </button>
              </div>
              <button 
                type="submit"
                disabled={loading || !inputMessage.trim() || isListening}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer disabled:bg-slate-205 dark:disabled:bg-slate-800 disabled:shadow-none disabled:cursor-not-allowed text-sm"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          // --- Report Card View ---
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center py-4 bg-indigo-50/20 dark:bg-indigo-950/15 border border-indigo-100/35 dark:border-indigo-900/40 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <h4 className="text-sm font-extrabold text-indigo-755 dark:text-indigo-400 tracking-wide uppercase">Mock Interview Completed!</h4>
              <p className="text-[11px] text-slate-405 dark:text-slate-500 font-semibold mt-1">Here is your detailed AI Evaluation report.</p>

              {/* Large Ring Gauge */}
              <div className="mt-5 flex justify-center">
                <div className="relative w-28 h-28 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-800 border-4 border-indigo-500 shadow-md">
                  <span className="text-3xl font-black text-indigo-700 dark:text-indigo-400 leading-none">{report.overallScore}</span>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-1">Overall Fit</span>
                </div>
              </div>
            </div>

            {/* Feedback Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Evaluation Summary</h4>
              <p className="text-sm text-slate-655 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl font-medium">
                {report.feedbackSummary}
              </p>
            </div>

            {/* Strengths & Weaknesses Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Key Strengths</h4>
                <ul className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/45 dark:border-emerald-900/30 p-4 rounded-2xl space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {report.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-505 font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider">Areas to Improve</h4>
                <ul className="bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/45 dark:border-amber-900/30 p-4 rounded-2xl space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {report.weaknesses?.map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-505 font-bold">⚠</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question Suggestions / Guide */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Questions & Suggested Perfect Answers</h4>
              
              <div className="space-y-3">
                {report.suggestedAnswers?.map((item, idx) => (
                  <details key={idx} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                    <summary className="px-5 py-4 font-bold text-sm text-slate-750 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer flex justify-between items-center transition-colors">
                      <span className="flex-1 pr-4">Q{idx + 1}: {item.question}</span>
                      <span className="text-xs text-indigo-500 font-black transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-50/50 dark:border-slate-800/80 leading-relaxed font-medium">
                      <p className="font-bold text-indigo-755 dark:text-indigo-400 mb-1">AI Recommendation:</p>
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
