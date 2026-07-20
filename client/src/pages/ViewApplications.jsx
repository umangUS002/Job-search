import React, { useContext, useEffect, useState } from 'react'
import { assets, viewApplicationsPageData } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import axios from 'axios'

function ViewApplications() {

  const { backendUrl, companyToken } = useContext(AppContext)

  const [applicants, setApplicants] = useState([])

  // Function to fetch company Job Applications Data
  const fetchCompanyJobApplications = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/company/applicants',
        { headers: { token: companyToken } }
      )

      if (data.success) {
        setApplicants(data.applications.reverse())
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  // Function to update job application status
  const changeJobApplicationStatus = async (id, status) => {
    try {

      const { data } = await axios.post(backendUrl + '/api/company/change-status',
        { id, status },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        fetchCompanyJobApplications()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplications()
    }
  }, [companyToken])

  return applicants ? applicants.length === 0 ? (
    <div className='flex items-center justify-center h-[70vh]'>
      <p className='text-xl sm:text-2xl text-slate-500 dark:text-slate-400 font-semibold'>No Applications Available</p>
    </div>
  ) : (
    <div className='container mx-auto p-4 max-w-5xl'>
      <div className='bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-sm rounded-3xl p-6 sm:p-8 overflow-hidden'>
        <div className="mb-6">
          <h2 className='text-xl font-bold text-slate-800 dark:text-slate-100'>Candidate Applications</h2>
          <p className='text-xs text-slate-400 dark:text-slate-500 mt-1'>Review resumes, assess candidates, and manage their application process.</p>
        </div>

        <div className='overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900/40'>
          <table className='w-full border-collapse max-sm:text-sm'>
            <thead>
              <tr className='bg-slate-50/75 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80'>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left'>#</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left'>Candidate</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left max-sm:hidden'>Job Title</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left max-sm:hidden'>Location</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left'>Resume</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50 dark:divide-slate-800/40'>
              {applicants.filter(item => item.jobId && item.userId).map((applicant, index) => (
                <tr key={index} className='hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors duration-150 text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-slate-850/10'>
                  <td className='py-4 px-6 text-slate-400 dark:text-slate-500 text-sm font-semibold'>{index + 1}</td>
                  <td className='py-4 px-6'>
                    <div className='flex items-center gap-3'>
                      <img className='w-9 h-9 rounded-full border border-slate-100 dark:border-slate-800 object-cover shadow-sm max-sm:hidden' src={applicant.userId.image} alt='' />
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{applicant.userId.name}</span>
                    </div>
                  </td>
                  <td className='py-4 px-6 text-slate-650 dark:text-slate-350 text-sm font-medium max-sm:hidden'>{applicant.jobId.title}</td>
                  <td className='py-4 px-6 text-slate-500 dark:text-slate-400 text-sm font-medium max-sm:hidden'>{applicant.jobId.location}</td>
                  <td className='py-4 px-6'>
                    <a href={applicant.userId.resume} target='_blank' rel='noopener noreferrer'
                      className='bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 px-3.5 py-1.5 rounded-xl inline-flex gap-2 items-center text-xs font-bold shadow-sm transition-all duration-150'
                    >
                      View CV <img className="w-3 dark:invert" src={assets.resume_download_icon} alt='' />
                    </a>
                  </td>
                  <td className='py-4 px-6 relative'>
                    {applicant.status === "Pending"
                      ? <div className='relative inline-block text-left group'>
                          <button className='px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-300 font-bold transition-all text-xs cursor-pointer action-button'>
                            Pending ▼
                          </button>
                          <div className='z-10 hidden absolute right-0 top-full mt-1.5 w-32 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-xl group-hover:block transition-all'>
                            <button onClick={() => changeJobApplicationStatus(applicant._id, 'Accepted')} className='block w-full text-left px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 rounded-t-xl transition-all font-bold'>Accept</button>
                            <button onClick={() => changeJobApplicationStatus(applicant._id, 'Rejected')} className='block w-full text-left px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 rounded-b-xl transition-all font-bold'>Reject</button>
                          </div>
                        </div>
                      : <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                          applicant.status === 'Accepted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50'
                        }`}>
                          {applicant.status}
                        </span>
                    }
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

export default ViewApplications
