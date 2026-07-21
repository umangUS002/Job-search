import React from 'react'

export function HomeStats() {
  const stats = [
    { value: "10,000+", label: "Active Job Openings", icon: "💼", color: "from-indigo-500 to-cyan-500" },
    { value: "500+", label: "Partner Companies", icon: "🏢", color: "from-purple-500 to-indigo-500" },
    { value: "98.4%", label: "Applicant Success Rate", icon: "🚀", color: "from-emerald-500 to-teal-500" },
    { value: "150,000+", label: "Registered Job Seekers", icon: "🧑‍💻", color: "from-cyan-500 to-blue-500" }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-12 md:px-20 py-6 sm:py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/80 p-5 sm:p-8 rounded-3xl backdrop-blur-md">
        {stats.map((stat, i) => (
          <div key={i} className="text-center space-y-1.5 sm:space-y-2 group">
            <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 filter drop-shadow-sm transform transition-transform group-hover:scale-110 duration-200">
              {stat.icon}
            </div>
            <h4 className={`text-xl sm:text-2xl lg:text-4xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </h4>
            <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeFeatures() {
  const scrollRef = React.useRef(null);
  const [activeDot, setActiveDot] = React.useState(0);

  const features = [
    {
      title: "AI Resume Match Analyzer",
      description: "Upload your resume and get immediate insights on matching percentages, missing key skills, ATS compatibility rating, and customized growth plans.",
      icon: "✨",
      badge: "AI Powered"
    },
    {
      title: "Interactive AI Mock Interviews",
      description: "Directly practice audio-based virtual interviews tailored to each specific job requirement, getting immediate grading and detailed feedback.",
      icon: "🎙️",
      badge: "Practice Mode"
    },
    {
      title: "Curated Official Listings",
      description: "Access verified, hand-picked job listings directly uploaded by company recruiters, completely free of generic scraping duplicates.",
      icon: "🛡️",
      badge: "Verified"
    },
    {
      title: "Smart Application Tracker",
      description: "Track the real-time status of all your applications (Applied, Shortlisted, Interviewing, Accepted) within one intuitive candidate dashboard.",
      icon: "📊",
      badge: "Real-time"
    }
  ];

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const firstCard = scrollRef.current.querySelector('.feature-card');
      if (firstCard) {
        const cardWidth = firstCard.clientWidth;
        const gap = 24; // gap-6
        const scrollAmount = (cardWidth + gap) * (direction === 'left' ? -1 : 1);
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const updateActiveDot = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.querySelector('.feature-card')?.clientWidth || 300;
      const gap = 24;
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setActiveDot(index);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-12 md:px-20 py-10 sm:py-16">
      {/* CSS override to hide scrollbars locally */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}} />

      {/* Header section with heading and controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 sm:mb-10">
        <div className="max-w-2xl">
          <h2 className="text-xs uppercase tracking-widest font-extrabold text-indigo-650 dark:text-indigo-400 mb-2">Platform Capabilities</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-855 dark:text-slate-100">
            Everything You Need to <span className="bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent">Land the Offer</span>
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
            ApexHire combines advanced artificial intelligence with premium career management tools to accelerate your placement journey.
          </p>
        </div>
        
        {/* Slider Controls */}
        <div className="flex gap-3 max-md:self-end">
          <button
            onClick={() => handleScroll('left')}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-350 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm font-semibold"
          >
            ←
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-350 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm font-semibold"
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal scrollbar-hidden container */}
      <div 
        ref={scrollRef}
        onScroll={updateActiveDot}
        className="scrollbar-none flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {features.map((feat, i) => (
          <div 
            key={i} 
            className="feature-card snap-start shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] group relative bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-350 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all"></div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl sm:text-4xl filter drop-shadow-sm transform transition-transform group-hover:rotate-12 duration-200">{feat.icon}</span>
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {feat.badge}
                </span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                {feat.title}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed min-h-[75px] sm:min-h-[90px]">
                {feat.description}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              Learn more <span className="text-sm">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Slider indicators */}
      <div className="flex justify-center gap-2 mt-4 sm:mt-6">
        {Array.from({ length: features.length }).map((_, idx) => (
          <div 
            key={idx}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
              activeDot === idx 
                ? 'w-4 sm:w-6 bg-indigo-600' 
                : 'w-1 sm:w-1.5 bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload & Build",
      description: "Quickly sign up and upload your resume. Our system automatically parses your core skills and preferences."
    },
    {
      step: "02",
      title: "Get AI Recommendations",
      description: "Instantly see matching scores and skill gaps on every job posting, ensuring you focus on high-probability fits."
    },
    {
      step: "03",
      title: "Practice & Apply",
      description: "Simulate audio mock interviews for target listings to prepare yourself before sending off your application with one click."
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-12 md:px-20 py-10 sm:py-16">
      <div className="bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 relative z-10">
          <h2 className="text-xs uppercase tracking-widest font-extrabold text-cyan-400 mb-2">Process</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">How It Works</h3>
          <p className="text-slate-350 text-sm mt-3 leading-relaxed">
            Landing your dream job doesn't have to be complicated. Our structured AI pipeline guides you from registration to interview-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {steps.map((item, i) => (
            <div key={i} className="relative flex flex-col items-start space-y-3 sm:space-y-4 group">
              <div className="text-5xl sm:text-6xl font-black text-indigo-500/30 group-hover:text-indigo-400/50 transition-colors duration-200 select-none leading-none">
                {item.step}
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {item.description}
              </p>
              {i < 2 && (
                <div className="hidden lg:block absolute top-6 -right-4 w-12 h-[1px] bg-gradient-to-r from-indigo-500/50 to-transparent pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
