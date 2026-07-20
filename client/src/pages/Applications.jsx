import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { assets, jobsApplied } from '../assets/assets';
import moment from 'moment'
import Footer from '../components/Footer';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import axios from 'axios';

function Applications() {

  const { user } = useUser()
  const { getToken } = useAuth()

  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);

  const { backendUrl, userData, userApplications, fetchUserData,fetchUserApplications } = useContext(AppContext)

  const updateResume = async() => {

    try {
      
      const formData = new FormData();
      formData.append('resume', resume)

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/users/update-resume', 
        formData,
        {headers: {Authorization: `Bearer ${token}`}}
      )

      if(data.success){
        toast.success(data.message)
        await fetchUserData()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
        toast.error(error.message)
    }

    setIsEdit(false)
    setResume(null)

  }

  useEffect(() => {
      if(user){
        fetchUserApplications()
      }
  },[user])

  return (
    <>
      <Navbar /> 
      <div className='container px-4 min-h-[70vh] 2xl:px-20 mx-auto my-12'>
        
        {/* Resume Section */}
        <div className='bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-sm p-6 sm:p-8 rounded-3xl mb-10'>
          <h2 className='text-xl font-bold text-slate-800 dark:text-slate-100 mb-2'>Your Profile Resume</h2>
          <p className='text-xs text-slate-400 dark:text-slate-500 mb-5'>Upload or update your PDF resume to instantly apply to listings.</p>
          <div className='flex gap-3 items-center flex-wrap'>
            {
              isEdit || userData && userData.resume === ""
              ? <>
                  <label className='flex items-center cursor-pointer' htmlFor='resumeUpload'>
                    <div className='bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-850 px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors duration-150'>
                      <p className='text-sm text-slate-600 dark:text-slate-300 font-semibold'>{resume ? resume.name : "Select Resume (PDF)"}</p>
                      <img className='w-4 opacity-70 dark:invert' src={assets.profile_upload_icon} alt='' />
                    </div>
                    <input id='resumeUpload' onChange={e => setResume(e.target.files[0])} accept='application/pdf' type='file' hidden/>
                  </label>
                  <button onClick={updateResume} className='bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm font-semibold rounded-xl px-6 py-2.5 cursor-pointer text-sm transition-colors duration-200'>
                    Save
                  </button>
                  {userData?.resume && (
                    <button onClick={()=>setIsEdit(false)} className='text-slate-500 dark:text-slate-400 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-5 py-2.5 text-sm transition-colors duration-200 font-semibold cursor-pointer'>
                      Cancel
                    </button>
                  )}
              </>
              : <div className='flex gap-3'>
                <a target="_blank" href={userData?.resume} className='bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm'>
                  View Resume
                </a>
                <button onClick={()=>setIsEdit(true)} className='text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-5 py-2.5 text-sm transition-all duration-200 font-semibold cursor-pointer'>
                  Replace
                </button>
              </div>
            }
          </div>

          {/* AI Extracted Profile Insights */}
          {userData?.resumeData && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <h3 className="text-lg font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-2 mb-4">
                <span className="inline-block p-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">✨</span>
                AI-Extracted Resume Profile
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Skills & Education */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">Skills Extracted</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {userData.resumeData.skills?.map((skill, idx) => (
                        <span key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {skill}
                        </span>
                      ))}
                      {(!userData.resumeData.skills || userData.resumeData.skills.length === 0) && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">No skills parsed yet.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">Education</h4>
                    <div className="space-y-3">
                      {userData.resumeData.education?.map((edu, idx) => (
                        <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{edu.degree}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{edu.school} | {edu.year}</p>
                        </div>
                      ))}
                      {(!userData.resumeData.education || userData.resumeData.education.length === 0) && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">No education entries parsed.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Experience & Projects */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">Experience</h4>
                    <div className="space-y-3">
                      {userData.resumeData.experience?.map((exp, idx) => (
                        <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{exp.role}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{exp.company} | {exp.duration}</p>
                        </div>
                      ))}
                      {(!userData.resumeData.experience || userData.resumeData.experience.length === 0) && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">No experience entries parsed.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">Projects</h4>
                    <div className="space-y-3">
                      {userData.resumeData.projects?.map((proj, idx) => (
                        <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{proj.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-450 font-medium mt-1 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                      {(!userData.resumeData.projects || userData.resumeData.projects.length === 0) && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">No projects parsed.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Applied Jobs Section */}
        <h2 className='text-xl font-bold text-slate-800 dark:text-slate-100 mb-5'>Applied Opportunities</h2>
        
        <div className='overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900/40'>
          <table className='min-w-full border-collapse'>
            <thead>
              <tr className='bg-slate-50/75 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80'>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left'>Company</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left'>Job Title</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left max-sm:hidden'>Location</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left max-sm:hidden'>Applied Date</th>
                <th className='py-4 px-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider text-left'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50 dark:divide-slate-800/40'>
              {userApplications.map((job, index) => (
                <tr key={index} className='hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors duration-150 border-b border-slate-50 dark:border-slate-850/10'>
                  <td className='px-6 py-4 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200'>
                    <div className='w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 p-1 flex items-center justify-center overflow-hidden'>
                      <img className='max-h-full max-w-full object-contain dark:brightness-95' src={job.companyId?.image} alt='' />
                    </div>
                    {job.companyId?.name}
                  </td>
                  <td className='py-4 px-6 text-slate-600 dark:text-slate-300 text-sm font-medium'>{job.jobId?.title}</td>
                  <td className='py-4 px-6 text-slate-500 dark:text-slate-400 text-sm font-medium max-sm:hidden'>{job.jobId?.location}</td>
                  <td className='py-4 px-6 text-slate-400 dark:text-slate-500 text-sm font-medium max-sm:hidden'>{moment(job?.date).format('ll')}</td>
                  <td className='py-4 px-6'>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      job?.status === 'Accepted' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/50'
                        : job?.status === 'Rejected' 
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450 border-rose-100 dark:border-rose-900/50' 
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 border-amber-100 dark:border-amber-900/50'
                    }`}>
                      {job?.status}
                    </span>
                  </td>
                </tr>
              ))}
              {userApplications.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-450 text-sm font-medium">
                    You haven't applied to any jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Applications
