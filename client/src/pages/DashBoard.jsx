import React, { useContext, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext';
import BrandLogo from '../components/BrandLogo';

function DashBoard() {

    const navigate = useNavigate();

    const {companyData, setCompanyData, setCompanyToken} = useContext(AppContext)

    // Function to logout for company
    const logout = () => {
        setCompanyToken(null);
        localStorage.removeItem('companyToken');
        setCompanyData(null);
        navigate('/');
    }

    useEffect(()=>{
        if(companyData){
            navigate('/dashboard/manage-jobs')
        }
    },[companyData])

  return (
    <div className='min-h-screen bg-slate-50/50 dark:bg-slate-950/20'>

        {/*Navbar for recruiter panel*/}
        <div className='sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 py-3 px-5 shadow-sm transition-all duration-300'>
            <div className='flex justify-between items-center'>
                <BrandLogo onClick={e => navigate('/')} className="scale-90 origin-left" />
                                    
                {companyData && (
                    <div className='flex items-center gap-3'>
                    <p className='max-sm:hidden text-slate-650 dark:text-slate-300 text-sm font-medium'>Welcome, <span className='text-slate-800 dark:text-slate-100 font-bold'>{companyData.name}</span></p>
                    <div className='relative group'>
                        <img className='w-9 h-9 border border-slate-100 dark:border-slate-800 rounded-full object-cover shadow-sm cursor-pointer' src={companyData.image} alt='' />
                        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black dark:text-white rounded pt-12'>
                            <ul className='list-none m-0 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-sm shadow-xl min-w-[120px]'>
                                <li onClick={logout} className='py-2 px-3 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-650 dark:hover:text-red-400 rounded-lg cursor-pointer transition-colors font-medium'>Logout</li>
                            </ul>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </div>

        <div className='flex items-start'>

            {/*Left Sidebar*/}
            <div className='inline-block min-h-screen border-r border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 w-20 sm:w-64 transition-all duration-300'>
                <ul className='flex flex-col pt-6 text-slate-700 dark:text-slate-300 gap-1'>
                    <NavLink className={({isActive}) => `flex items-center p-3.5 sm:px-6 gap-3 w-full hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 ${isActive ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-r-4 border-indigo-650 dark:border-indigo-500 text-indigo-650 dark:text-indigo-400 font-bold' : 'font-medium'}`} to={'/dashboard/add-job'}>
                        <img className='min-w-4 w-5 h-5 opacity-60 dark:invert group-hover:opacity-100' src={assets.add_icon} alt='' />
                        <p className='max-sm:hidden text-sm'>Add Job</p>
                    </NavLink>
                    <NavLink className={({isActive}) => `flex items-center p-3.5 sm:px-6 gap-3 w-full hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 ${isActive ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-r-4 border-indigo-655 dark:border-indigo-500 text-indigo-655 dark:text-indigo-400 font-bold' : 'font-medium'}`} to={'/dashboard/manage-jobs'}>
                        <img className='min-w-4 w-5 h-5 opacity-60 dark:invert group-hover:opacity-100' src={assets.home_icon} alt='' />
                        <p className='max-sm:hidden text-sm'>Manage Jobs</p>
                    </NavLink>
                    <NavLink className={({isActive}) => `flex items-center p-3.5 sm:px-6 gap-3 w-full hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 ${isActive ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-r-4 border-indigo-655 dark:border-indigo-500 text-indigo-655 dark:text-indigo-400 font-bold' : 'font-medium'}`} to={'/dashboard/view-applications'}>
                        <img className='min-w-4 w-5 h-5 opacity-60 dark:invert group-hover:opacity-100' src={assets.person_tick_icon} alt='' />
                        <p className='max-sm:hidden text-sm'>View Applications</p>
                    </NavLink>
                </ul>
            </div>

            <div className='flex-1 h-full p-4 sm:p-8 overflow-y-auto'>
                <Outlet/>
            </div>

        </div>
      
    </div>
  )
}

export default DashBoard
