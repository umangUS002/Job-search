import React, { useContext, useEffect, useState, useRef } from 'react'
import axios from "axios";
import { AppContext } from '../context/AppContext'
import JobCard from './JobCard';
import gsap from 'gsap';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';

function JobListing() {

  const { backendUrl, searchFilter, userData } = useContext(AppContext);
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState("all");

  // 🔥 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const gridRef = useRef(null);

  // 🔥 FETCH JOBS
  const fetchJobs = async (searchParams = {}) => {
    try {

      setLoading(true);

      const reqKeyword = searchParams.keyword !== undefined ? searchParams.keyword : keyword;
      const reqLocation = searchParams.location !== undefined ? searchParams.location : location;
      const reqSkill = searchParams.skill !== undefined ? searchParams.skill : skill;
      const reqResumeMatch = searchParams.resumeMatch !== undefined ? searchParams.resumeMatch : (searchMode === "resume");

      let headers = {};
      if (isSignedIn) {
        try {
          const token = await getToken();
          headers = { Authorization: `Bearer ${token}` };
        } catch (authErr) {
          console.log("Clerk token fetching error:", authErr.message);
        }
      }

      const { data } = await axios.get(
        `${backendUrl}/api/jobs/filter`,
        {
          params: { keyword: reqKeyword, location: reqLocation, skill: reqSkill, resumeMatch: reqResumeMatch },
          headers
        }
      );

      if (data.success) {
        setJobs(data.jobs);
        setCurrentPage(1); // reset page on new search
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Sync with AppContext searchFilter (triggered by Hero search)
  useEffect(() => {
    if (searchFilter) {
      const searchTitle = searchFilter.title || "";
      const searchLoc = searchFilter.location || "";
      setKeyword(searchTitle);
      setLocation(searchLoc);
      fetchJobs({ keyword: searchTitle, location: searchLoc });
    }
  }, [searchFilter, isSignedIn]);

  // 🔥 PAGINATION LOGIC
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // GSAP animation on jobs change
  useEffect(() => {
    if (!loading && currentJobs.length > 0 && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.job-card');
      gsap.killTweensOf(cards);
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [currentJobs, loading]);

  return (
    <div className='container mx-auto px-4 sm:px-12 md:px-20 py-16'>

      {/* 🔍 FILTER BAR */}
      <div className='bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-sm p-4 rounded-2xl flex flex-col md:flex-row gap-3 mb-12 items-center'>
        
        <div className='w-full relative'>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search keywords..."
            className='border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 px-4 rounded-xl w-full text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-950/40 transition-colors duration-200'
          />
        </div>

        <div className='w-full relative'>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location..."
            className='border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 px-4 rounded-xl w-full text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-950/40 transition-colors duration-200'
          />
        </div>

        <div className='w-full relative'>
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Skill (React, Node, etc)..."
            className='border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 px-4 rounded-xl w-full text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-950/40 transition-colors duration-200'
          />
        </div>

        <button
          onClick={() => fetchJobs()}
          className='w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl cursor-pointer text-sm transition-colors duration-200'
        >
          Filter
        </button>

      </div>

      {/* RESULTS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className='text-2xl font-bold text-slate-800 dark:text-slate-100'>Latest Opportunities</h3>
        
        {userData?.resume && isSignedIn && (
          <div className="flex bg-slate-100 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setSearchMode("all");
                fetchJobs({ resumeMatch: false });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                searchMode === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250"
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => {
                setSearchMode("resume");
                fetchJobs({ resumeMatch: true });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                searchMode === "resume"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250"
              }`}
            >
              ✨ Match My Resume
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <div className='w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin'></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className='text-center py-20 border border-dashed rounded-2xl border-slate-200 bg-slate-50/50'>
          <p className='text-slate-500 font-medium'>No job listings fit this criteria.</p>
        </div>
      ) : (
        <>
          <div ref={gridRef} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {currentJobs.map((job, index) => (
              <JobCard key={job._id || index} job={job} />
            ))}

            {!isSignedIn && (
              <div className="job-card border border-dashed border-indigo-200 dark:border-indigo-900/50 p-6 bg-gradient-to-br from-indigo-50/15 to-white dark:from-indigo-950/10 dark:to-slate-900/30 hover:border-indigo-350 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-md rounded-2xl flex flex-col justify-between h-full text-center py-10 relative overflow-hidden group transition-all duration-300">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-3">🔒</span>
                  <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight">Unlock 100+ Opportunities</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2.5 leading-relaxed px-4">
                    Sign in to access all available engineering listings and unlock AI resume match suitability insights.
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800/80 w-full">
                  <button
                    onClick={() => {
                      scrollTo({ top: 0, behavior: 'smooth' });
                      toast.info("Please click 'Login' at the top of the page to unlock more jobs.");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl cursor-pointer text-xs transition-all duration-200"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 🔥 PAGINATION UI */}
          <div className='flex flex-col items-center mt-14 gap-5'>

            {/* Prev / Next */}
            <div className='flex gap-4'>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className='px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer'
              >
                Previous
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className='px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer'
              >
                Next
              </button>
            </div>

            {/* Page Numbers */}
            <div className='flex gap-2 flex-wrap justify-center'>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 border rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 ${
                    currentPage === index + 1
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

          </div>
        </>
      )}

    </div>
  )
}

export default JobListing