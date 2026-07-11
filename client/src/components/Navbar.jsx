import React, { useContext, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import {useClerk, UserButton, useUser} from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BrandLogo from './BrandLogo';
import gsap from 'gsap';

function Navbar() {

    const {openSignIn} = useClerk();
    const {user} = useUser();
    const navigate = useNavigate();
    const {setShowRecruiterLogin} = useContext(AppContext);
    
    const navRef = useRef(null);

    useEffect(() => {
        // Animate elements inside Navbar
        const elements = navRef.current.querySelectorAll('.nav-element');
        gsap.fromTo(elements, 
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
    }, []);

  return (
      <div ref={navRef} className='sticky top-0 z-50 glassmorphism border-b border-slate-100 py-3.5 shadow-sm transition-all duration-300'>
        <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
            <div className='nav-element'>
                <BrandLogo onClick={() => navigate('/')} />
            </div>
            {
                user 
                ? <div className='flex items-center gap-5 nav-element'>
                    <Link to={'/applications'} className='text-slate-600 hover:text-indigo-600 font-medium transition-colors duration-200 text-sm sm:text-base'>Applied Jobs</Link>
                    <p className='max-sm:hidden text-slate-300'>|</p>
                    <p className='max-sm:hidden text-slate-700 font-medium text-sm'>Hi, {user.firstName}</p>
                    <UserButton />
                  </div>
                : <div className='flex items-center gap-5 sm:gap-6 max-sm:text-xs nav-element'>
                <button onClick={e => setShowRecruiterLogin(true)} className='text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer transition-colors duration-200'>Recruiter Login</button>
                <button onClick={e => openSignIn()} className='bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-sm hover:shadow-indigo-500/10 text-white px-5 sm:px-7 py-2 rounded-full cursor-pointer font-medium transition-all duration-200 transform hover:-translate-y-0.5'>Login</button>
            </div>
            }
            
        </div>
      </div>
  )
}

export default Navbar
