
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import { assets } from "../assets/assets";
import MockInterviewModal from "../components/MockInterviewModal";
import CoverLetterModal from "../components/CoverLetterModal";

import kconvert from "k-convert";
import moment from "moment";
import parse from "html-react-parser";
import he from "he";

import { toast } from "react-toastify";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";

function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();

  const [JobData, setJobData] = useState(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const {
    jobs,
    backendUrl,
    userData,
    userApplications,
    fetchUserApplications
  } = useContext(AppContext);

  // fetch AI Resume Insights (after login only)
  const fetchAiAnalysis = async () => {
    try {
      setAiLoading(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/jobs/${id}/analyze`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setAiAnalysis(data);
      }
    } catch (error) {
      console.log("Failed to load AI resume analysis:", error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // fetch single job
  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`);

      if (data.success) {
        setJobData(data.job);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // apply to job
  const applyHandler = async () => {
    try {
      if (!userData) {
        return toast.error("Login to Apply");
      }

      if (!userData.resume) {
        navigate("/applications");
        return toast.error("Upload Resume to Apply");
      }

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/users/apply`,
        { jobId: JobData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // check if user already applied
  const checkAlreadyApplied = () => {
    const hasApplied = userApplications.some(
      (item) => item?.jobId?._id === JobData?._id
    );

    setIsAlreadyApplied(hasApplied);
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (id && isSignedIn) {
      fetchAiAnalysis();
    } else {
      setAiAnalysis(null);
    }
  }, [id, isSignedIn, userData]);

  useEffect(() => {
    if (JobData && userApplications.length > 0) {
      checkAlreadyApplied();
    }
  }, [JobData, userApplications]);

  const recommendedJobs = (() => {
    if (!JobData || !jobs || jobs.length === 0) return [];
    
    const appliedJobsIds = new Set(
      userApplications.map((app) => app?.jobId?._id)
    );

    const candidates = jobs
      .filter((job) => job?._id !== JobData?._id)
      .filter((job) => !appliedJobsIds.has(job._id));

    const scored = candidates.map((job) => {
      let score = 0;
      if (job.companyId?._id === JobData.companyId?._id) score += 4;
      if (job.level && JobData.level && job.level.toLowerCase() === JobData.level.toLowerCase()) score += 2;
      if (job.location && JobData.location && job.location.toLowerCase() === JobData.location.toLowerCase()) score += 1;
      if (job.skills && JobData.skills) {
        const shared = job.skills.filter(s => JobData.skills.includes(s));
        score += shared.length;
      }
      return { job, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 4).map(item => item.job);
  })();

  if (!JobData) return <Loading />;

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto">

        {/* Job Header */}
        <div className="bg-white dark:bg-transparent text-black dark:text-white rounded-lg w-full">

          <div className="flex justify-center md:justify-between flex-wrap gap-8 px-6 sm:px-12 py-14 mb-8 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/50 rounded-3xl shadow-sm">

            <div className="flex flex-col md:flex-row items-center gap-5">

              <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-855 rounded-2xl p-2 shadow-sm">
                <img
                  className="max-h-full max-w-full object-contain dark:brightness-95"
                  src={JobData.companyId?.image || "/company.png"}
                  alt="company"
                />
              </div>

              <div className="text-center md:text-left text-slate-700 dark:text-slate-300">

                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-855 dark:text-slate-100 tracking-tight">
                  {JobData.title}
                </h1>

                <div className="flex flex-row flex-wrap max-md:justify-center gap-y-2.5 gap-6 items-center text-slate-500 dark:text-slate-400 mt-3 text-xs sm:text-sm font-medium">

                  <span className="flex items-center gap-1.5">
                    <img className="h-4 opacity-60 dark:invert" src={assets.suitcase_icon} alt="" />
                    {JobData.companyId?.name || "Company Name"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <img className="h-4 opacity-60 dark:invert" src={assets.location_icon} alt="" />
                    {JobData.location || "Remote"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <img className="h-4 opacity-60 dark:invert" src={assets.person_icon} alt="" />
                    {JobData.level || "Not specified"}
                  </span>

                  <span className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400 font-bold">
                    <img className="h-4 opacity-75 dark:invert" src={assets.money_icon} alt="" />
                    CTC:{" "}
                    {JobData.salary
                      ? kconvert.convertTo(JobData.salary)
                      : "Not disclosed"}
                  </span>

                </div>
                
                <div className="flex gap-2 flex-wrap mt-4">
                  {JobData.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/50 px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center text-end text-sm max-md:text-center">

              {JobData.url?.startsWith("http") ? (
                // 🔗 Scraped job → external apply
                <a
                  href={JobData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-md shadow-emerald-600/10 text-white p-3 px-10 rounded-2xl cursor-pointer inline-block text-center font-bold transition-all duration-200 hover:scale-[1.02]"
                >
                  Apply Externally
                </a>
              ) : (
                // 🧑‍💼 Admin job → internal apply
                <button
                  onClick={applyHandler}
                  disabled={isAlreadyApplied}
                  className={`p-3 px-10 text-white rounded-2xl cursor-pointer font-bold shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    isAlreadyApplied 
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10" 
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10"
                    }`}
                >
                  {isAlreadyApplied ? "Already Applied" : "Apply Now"}
                </button>
              )}

              <p className="mt-2 text-slate-400 dark:text-slate-500 text-xs font-medium">
                Posted{" "}
                {JobData.date
                  ? moment(JobData.date).fromNow()
                  : "Recently"}
              </p>

            </div>
          </div>
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10">

            {/* Job Description */}
            <div className="w-full lg:w-2/3 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800/80">Job Description</h2>

              <div className="prose max-w-none text-slate-650 dark:text-slate-300 leading-relaxed rich-text">
                {JobData.description
                  ? parse(he.decode(JobData.description))
                  : "No description available"}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                {JobData.url?.startsWith("http") ? (
                  // 🔗 Scraped job → external apply
                  <a
                    href={JobData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-md shadow-emerald-600/10 text-white p-3 px-10 rounded-2xl cursor-pointer inline-block text-center font-bold transition-all duration-200 hover:scale-[1.02]"
                  >
                    Apply Externally
                  </a>
                ) : (
                  // 🧑‍💼 Admin job → internal apply
                  <button
                    onClick={applyHandler}
                    disabled={isAlreadyApplied}
                    className={`p-3.5 px-10 text-white rounded-2xl cursor-pointer font-bold shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      isAlreadyApplied 
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10" 
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10"
                      }`}
                  >
                    {isAlreadyApplied ? "Already Applied" : "Apply Now"}
                  </button>
                )}
              </div>

            </div>

            {/* More Jobs & AI Insights */}
            <div className="w-full lg:w-1/3 space-y-6">

              {/* AI Resume Match Insights (Authenticated only) */}
              {isSignedIn && (
                <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <h3 className="font-extrabold text-lg text-slate-855 dark:text-slate-100 flex items-center gap-2">
                    <span className="inline-block p-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm">✨</span>
                    AI Resume Insights
                  </h3>

                  {aiLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-8 h-8 border-3 border-slate-200 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                  ) : aiAnalysis?.hasResume ? (
                    <div className="space-y-5">
                      
                      {/* Scores Gauges */}
                      <div className="flex justify-around items-center gap-4 py-2 bg-slate-50/55 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3">
                        <div className="text-center">
                          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-150 dark:border-indigo-900/50">
                            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{aiAnalysis.analysis.matchScore}%</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mt-2">Match Score</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-150 dark:border-emerald-900/50">
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{aiAnalysis.analysis.atsScore}%</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mt-2">ATS Rating</p>
                        </div>
                      </div>

                      {/* AI Job Summary */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Role Summary</h4>
                        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                          {aiAnalysis.analysis.summary}
                        </p>
                      </div>

                      {/* Missing Skills */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Missing Skills ({aiAnalysis.analysis.missingSkills?.length || 0})</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {aiAnalysis.analysis.missingSkills?.map((skill, idx) => (
                            <span key={idx} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-sm">
                              {skill}
                            </span>
                          ))}
                          {(!aiAnalysis.analysis.missingSkills || aiAnalysis.analysis.missingSkills.length === 0) && (
                            <p className="text-[11px] text-emerald-650 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              ✓ All keywords matched!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Skill Gap Analysis */}
                      <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/50 p-4 rounded-2xl text-[11px] text-indigo-750 dark:text-indigo-350 leading-relaxed font-medium">
                        <p className="font-bold mb-1 flex items-center gap-1 text-indigo-800 dark:text-indigo-400">
                          💡 Advisor Recommendation
                        </p>
                        {aiAnalysis.analysis.skillGapAnalysis}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex flex-col gap-2">
                        <button
                          onClick={() => setShowMockInterview(true)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-550 hover:from-indigo-550 hover:to-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                        >
                          🎙️ Practice Mock Interview
                        </button>
                        <button
                          onClick={() => setShowCoverLetter(true)}
                          className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs py-3 rounded-xl shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                        >
                          ✉️ Generate Cover Letter
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-950/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-505 dark:text-slate-400 font-semibold mb-3">Upload your resume to view AI match scores and missing skill insights.</p>
                      <button onClick={() => navigate("/applications")} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer shadow-sm">
                        Upload Resume
                      </button>
                    </div>
                  )}
                </div>
              )}

              <h2 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full"></span>
                Recommended Jobs
              </h2>

              <div className="space-y-4">
                {recommendedJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
                {recommendedJobs.length === 0 && (
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium py-6 text-center bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                    No recommendations available.
                  </p>
                )}
              </div>

            </div>     

            </div>
          </div>
        </div>

      <Footer />

      {showMockInterview && (
        <MockInterviewModal
          jobId={JobData._id}
          jobTitle={JobData.title}
          companyName={JobData.companyId?.name}
          onClose={() => setShowMockInterview(false)}
        />
      )}

      {showCoverLetter && (
        <CoverLetterModal
          jobId={JobData._id}
          jobTitle={JobData.title}
          companyName={JobData.companyId?.name}
          onClose={() => setShowCoverLetter(false)}
        />
      )}
    </>
  );
}

export default ApplyJob;
