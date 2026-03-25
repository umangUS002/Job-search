import React, { useContext, useEffect, useState } from 'react'
import axios from "axios";
import { AppContext } from '../context/AppContext'
import JobCard from './JobCard';

function JobListing() {

  const { backendUrl } = useContext(AppContext);

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // 🔥 FETCH JOBS
  const fetchJobs = async () => {
    try {

      setLoading(true);

      const { data } = await axios.get(
        `${backendUrl}/api/jobs/filter`,
        {
          params: { keyword, location, skill }
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

  useEffect(() => {
    fetchJobs();
  }, []);

  // 🔥 PAGINATION LOGIC
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div className='container mx-auto px-20 py-10'>

      {/* 🔍 FILTER BAR */}
      <div className='flex flex-col md:flex-row gap-3 mb-8'>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search jobs..."
          className='border p-3 rounded w-full'
        />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className='border p-3 rounded w-full'
        />

        <input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Skill (React, AI, etc)"
          className='border p-3 rounded w-full'
        />

        <button
          onClick={fetchJobs}
          className='bg-blue-600 text-white px-6 py-3 rounded'
        >
          Search
        </button>

      </div>

      {/* RESULTS */}
      <h3 className='text-2xl font-semibold mb-4'>Latest Jobs</h3>

      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
            {currentJobs.map((job, index) => (
              <JobCard key={index} job={job} />
            ))}
          </div>

          {/* 🔥 PAGINATION UI */}
          <div className='flex flex-col items-center mt-10 gap-4'>

            {/* Prev / Next */}
            <div className='flex gap-6'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className='px-4 py-2 border rounded'
              >
                Prev
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className='px-4 py-2 border rounded'
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
                  className={`w-10 h-10 border rounded ${
                    currentPage === index + 1
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-500'
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