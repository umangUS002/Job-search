import React, { useState, useEffect, useRef } from 'react';

export default function AiCoachDemo() {
  const [activePrompt, setActivePrompt] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const prompts = [
    {
      title: "Optimize Resume 📄",
      userQuery: "Scan my resume and optimize it for a Senior Frontend Engineer role.",
      aiResponse: "🔍 Scanning Resume...\n\n📈 Current ATS Score: 62%\n\n💡 Recommendations:\n- Add keywords: 'React 19', 'Next.js App Router', 'TailwindCSS'.\n- Rephrase experience with action verbs: 'Designed scalability architecture...' instead of 'Worked on frontends'.\n\n🎯 Target ATS Rating: 94%"
    },
    {
      title: "Audio Mock Prep 🎙️",
      userQuery: "Generate a mock interview question for a React developer position.",
      aiResponse: "🎙️ Dynamic Interview Simulation:\n\n💬 Question: 'Can you explain how React's virtual DOM works, and how reconciliation behaves when updating context?'\n\n💡 Tip: Focus on the difference between rendering and DOM commits. Click 'Practice Mode' on the job details page to speak your answer and receive real-time audio grading!"
    },
    {
      title: "Suitability Rating ✨",
      userQuery: "Am I a good match for the 'Staff DevSecOps Engineer' listing?",
      aiResponse: "📊 Suitability Report:\n\n🔥 Match Rating: 91% (High)\n\n✅ Strengths:\n- Docker, Redis, and CI/CD pipelines match key requirements.\n\n⚠️ Missing Keywords:\n- Kubernetes, AWS IAM policies.\n\n🎯 Decision: Recommended. Click 'Apply Now' to submit with customized cover letter."
    }
  ];

  const triggerChat = (index) => {
    setActivePrompt(index);
    setIsTyping(true);
    // Set user message
    setMessages([
      { sender: 'user', text: prompts[index].userQuery }
    ]);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: prompts[index].aiResponse }
      ]);
    }, 1200);
  };

  // Trigger first prompt on mount
  useEffect(() => {
    triggerChat(0);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="container mx-auto px-4 sm:px-12 md:px-20 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Side: Info & Chips */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-indigo-650 dark:text-indigo-400 mb-2">Interactive AI</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-855 dark:text-slate-100 leading-tight">
              Test Our Built-In <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">AI Career Coach</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
              ApexHire embeds direct resume scoring, mock interview simulations, and tailored career feedback right into your job applications page. Click below to test it:
            </p>
          </div>

          {/* Prompt Selector Chips */}
          <div className="flex flex-col gap-3">
            {prompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => triggerChat(idx)}
                className={`text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${
                  activePrompt === idx
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'bg-white dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="font-bold text-sm">{p.title}</span>
                <span className={`text-xs font-semibold opacity-70 group-hover:translate-x-1 transition-transform ${
                  activePrompt === idx ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  Try Live →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Chat Window Mockup */}
        <div className="lg:col-span-7">
          <div className="relative bg-slate-950 text-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 aspect-[4/3] sm:aspect-[16/10] flex flex-col justify-between">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800/60 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-sm shadow-md animate-pulse">
                  ✨
                </div>
                <div>
                  <h4 className="text-xs font-bold">Apex AI Coach</h4>
                  <span className="text-[9px] text-cyan-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    Online & Analyzing
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none relative z-10">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed font-medium ${
                      msg.sender === 'user'
                        ? 'bg-indigo-650 text-white rounded-br-none shadow-md shadow-indigo-600/15'
                        : 'bg-slate-900 border border-slate-800/80 text-slate-200 rounded-bl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl rounded-bl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Footer */}
            <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800/60 backdrop-blur-md flex items-center gap-3 relative z-10">
              <input
                disabled
                type="text"
                placeholder="Interact using the quick prompt buttons on the left..."
                className="flex-1 bg-slate-950 border border-slate-800/80 text-[10px] text-slate-500 rounded-xl px-4 py-2.5 outline-none select-none font-medium"
              />
              <button disabled className="bg-indigo-600 opacity-50 w-8 h-8 rounded-xl flex items-center justify-center text-xs">
                ➡️
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
