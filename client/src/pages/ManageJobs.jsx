import React, { useContext, useEffect, useState } from 'react'
import { manageJobsData } from '../assets/assets'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';

function ManageJobs() {

  const navigate = useNavigate();

  const [jobs, setJobs] = useState(false);

  const { backendUrl, companyToken } = useContext(AppContext)

  // Function to fetch company Job Applications data
  const fetchCompanyJobs = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/company/list-jobs',
        { headers: { token: companyToken } }
      )

      if (data.success) {
        setJobs(data.jobsData.reverse())
        console.log(data.jobsData)
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }

  }

  const changeJobVisibility = async (id) => {

    try {

      const { data } = await axios.post(backendUrl + '/api/company/change-visibility',
        { id }, { headers: { token: companyToken } }
      )

      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobs()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs();
    }
  }, [companyToken])

  return jobs ? jobs.length === 0 ? (
    <div className='flex items-center justify-center h-[70vh]'>
      <p className='text-xl sm:text-2xl text-slate-500 dark:text-slate-400 font-semibold'>No Jobs Available or Posted</p>
    </div>
  ) : (
    <div className='container p-4 max-w-5xl mx-auto'>
      <div className='bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-sm rounded-3xl p-6 sm:p-8 overflow-hidden'>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h2 className='text-xl font-bold text-slate-800 dark:text-slate-105'>Active Listings</h2>
            <p className='text-xs text-slate-400 dark:text-slate-500 mt-1'>Monitor, edit visibility, and track applicants for your job openings.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/add-job')} 
            className='bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer text-xs transition-all shadow-md shadow-indigo-600/10 active:scale-95'
          >
            Add New Job
          </button>
        </div>

        <div className='overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900/40'>
          <table className='min-w-full border-collapse max-sm:text-sm'>
            <thead>
              <tr className='bg-slate-50/75 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80'>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left max-sm:hidden'>#</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left'>Job Title</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left max-sm:hidden'>Date</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left max-sm:hidden'>Location</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-center'>Applicants</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-center'>Visible</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50 dark:divide-slate-800/40'>
              {jobs.map((job, index) => (
                <tr key={index} className='hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors duration-150 text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-slate-850/10'>
                  <td className='py-4 px-6 max-sm:hidden text-slate-400 dark:text-slate-500 text-sm font-semibold'>{index + 1}</td>
                  <td className='py-4 px-6 text-sm font-bold text-slate-800 dark:text-slate-100'>{job.title}</td>
                  <td className='py-4 px-6 max-sm:hidden text-slate-500 dark:text-slate-450 text-sm font-medium'>{moment(job.data).format('ll')}</td>
                  <td className='py-4 px-6 max-sm:hidden text-slate-500 dark:text-slate-450 text-sm font-medium'>{job.location}</td>
                  <td className='py-4 px-6 text-center'>
                    <span className="inline-block bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 rounded-lg text-xs font-bold text-indigo-650 dark:text-indigo-400">
                      {job.applicants}
                    </span>
                  </td>
                  <td className='py-4 px-6'>
                    <div className='flex justify-center items-center'>
                      {/* Modern Switch Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          onChange={() => changeJobVisibility(job._id)} 
                          checked={job.visible} 
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-300 after:border after:border-slate-300 dark:after:border-slate-650 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default ManageJobs
