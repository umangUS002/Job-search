import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { getShortDescription } from '../utils/text';

function JobCard({ job }) {

  const navigate = useNavigate();

  return (
    <div className='job-card border border-slate-100/90 p-6 bg-white shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1.5 rounded-2xl transition-all duration-300 ease-out flex flex-col justify-between h-full group'>
      <div>
        <div className='flex justify-between items-center mb-4'>
          <div className='w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-2'>
            <img
              className="max-h-full max-w-full object-contain"
              src={job.companyId?.image || assets.home_icon}
              alt={job.companyId?.name || "Company"}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {job.matchScore !== undefined && (
              <span className='text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm'>
                ✨ {job.matchScore}% Match
              </span>
            )}
            <span className='text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full'>
              {job.level || "Full Time"}
            </span>
          </div>
        </div>
        
        <h4 className='font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors duration-200 mt-2 line-clamp-1'>{job.title}</h4>
        
        <div className='flex items-center gap-2 mt-3 text-[11px] font-semibold text-slate-500'>
          <span className='bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5'>
            <img className='h-3 opacity-60' src={assets.location_icon} alt='' />
            {job.location}
          </span>
          <span className='bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5'>
            <img className='h-3 opacity-80' src={assets.money_icon} alt='' />
            {job.salary ? `${job.salary / 1000}k` : "Negotiable"}
          </span>
        </div>

        <p className="text-slate-500 text-sm mt-4 leading-relaxed line-clamp-3">
          {getShortDescription(job.description)}...
        </p>
      </div>

      <div className='mt-6 flex gap-3 text-xs font-semibold pt-4 border-t border-slate-50'>
        <button 
          onClick={() => { navigate(`/apply-jobs/${job._id}`); scrollTo(0, 0) }} 
          className='flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-sm text-white py-2.5 rounded-xl cursor-pointer text-center transition-all duration-200'
        >
          Apply Now
        </button>
        <button 
          onClick={() => { navigate(`/apply-jobs/${job._id}`); scrollTo(0, 0) }} 
          className='flex-1 text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 py-2.5 rounded-xl cursor-pointer text-center transition-all duration-200'
        >
          Learn More
        </button>
      </div>
    </div>
  )
}

export default JobCard
