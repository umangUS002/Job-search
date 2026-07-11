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
    <div className='min-h-screen bg-slate-50/50'>

        {/*Navbar for recruiter panel*/}
        <div className='sticky top-0 z-50 bg-white border-b border-slate-100 py-3 px-5 shadow-sm'>
            <div className='flex justify-between items-center'>
                <BrandLogo onClick={e => navigate('/')} className="scale-90 origin-left" />
                                    
                {companyData && (
                    <div className='flex items-center gap-3'>
                    <p className='max-sm:hidden text-slate-600 text-sm font-medium'>Welcome, <span className='text-slate-800 font-bold'>{companyData.name}</span></p>
                    <div className='relative group'>
                        <img className='w-9 h-9 border border-slate-100 rounded-full object-cover shadow-sm cursor-pointer' src={companyData.image} alt='' />
                        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
                            <ul className='list-none m-0 p-1.5 bg-white rounded-xl border border-slate-100 text-sm shadow-xl min-w-[120px]'>
                                <li onClick={logout} className='py-2 px-3 hover:bg-red-50 hover:text-red-600 rounded-lg cursor-pointer transition-colors font-medium'>Logout</li>
                            </ul>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </div>

        <div className='flex items-start'>

            {/*Left Sidebar*/}
            <div className='inline-block min-h-screen border-r border-slate-100 bg-white w-20 sm:w-64 transition-all duration-300'>
                <ul className='flex flex-col pt-6 text-slate-700 gap-1'>
                    <NavLink className={({isActive}) => `flex items-center p-3.5 sm:px-6 gap-3 w-full hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 ${isActive ? 'bg-indigo-50/60 border-r-4 border-indigo-600 text-indigo-600 font-bold' : 'font-medium'}`} to={'/dashboard/add-job'}>
                        <img className='min-w-4 w-5 h-5 opacity-60 group-hover:opacity-100' src={assets.add_icon} alt='' />
                        <p className='max-sm:hidden text-sm'>Add Job</p>
                    </NavLink>
                    <NavLink className={({isActive}) => `flex items-center p-3.5 sm:px-6 gap-3 w-full hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 ${isActive ? 'bg-indigo-50/60 border-r-4 border-indigo-600 text-indigo-600 font-bold' : 'font-medium'}`} to={'/dashboard/manage-jobs'}>
                        <img className='min-w-4 w-5 h-5 opacity-60 group-hover:opacity-100' src={assets.home_icon} alt='' />
                        <p className='max-sm:hidden text-sm'>Manage Jobs</p>
                    </NavLink>
                    <NavLink className={({isActive}) => `flex items-center p-3.5 sm:px-6 gap-3 w-full hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 ${isActive ? 'bg-indigo-50/60 border-r-4 border-indigo-600 text-indigo-600 font-bold' : 'font-medium'}`} to={'/dashboard/view-applications'}>
                        <img className='min-w-4 w-5 h-5 opacity-60 group-hover:opacity-100' src={assets.person_tick_icon} alt='' />
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
