import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import gsap from 'gsap';

function RecruiterLogin() {

    const navigate = useNavigate();

    const {setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData} = useContext(AppContext);

    const [state, setState] = useState('Login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('')

    const [image, setImage] = useState(false)

    const [isTextDataSubmitted, setIsTextdataSubmitted] = useState(false);

    const onSubmitHandler = async(e) => {
        e.preventDefault();

        if(state === 'Sign Up' && !isTextDataSubmitted){
            if (!isTextDataSubmitted) {
                return setIsTextdataSubmitted(true);
            }
            if (!image) {
                return toast.error('Please upload a company logo');
            }
        }

        try {
            
            if (state === 'Login') {
                const {data} = await axios.post(backendUrl + '/api/company/login', {email, password})
                
                if(data.success){
                    setCompanyData(data.company);
                    setCompanyToken(data.token);
                    localStorage.setItem('companyToken', data.token);
                    setShowRecruiterLogin(false);
                    
                    navigate('/dashboard');
                }else{
                    toast.error(data.message)
                }
            } else {
                const formData = new FormData();
                formData.append('name', name)
                formData.append('password', password)
                formData.append('email', email)
                formData.append('image', image)
                
                const { data } = await axios.post(backendUrl + '/api/company/register', formData)

                if(data.success){
                    setCompanyData(data.company);
                    setCompanyToken(data.token);
                    localStorage.setItem('companyToken', data.token);
                    setShowRecruiterLogin(false);
                    
                    navigate('/dashboard');
                } else {
                    toast.error(data.message)
                }

            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const modalRef = useRef(null);

    useEffect(()=>{
        document.body.style.overflow = 'hidden';
        
        // Elastic scale and slide up modal entrance
        gsap.fromTo(modalRef.current,
            { scale: 0.88, opacity: 0, y: 20 },
            { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
        );

        return () => {
            document.body.style.overflow = 'unset'
        }
    },[])

  return (
    <div className='fixed inset-0 z-50 backdrop-blur-md bg-slate-900/40 flex justify-center items-center p-4 transition-all duration-300'>
        <form 
            ref={modalRef} 
            onSubmit={onSubmitHandler} 
            className='relative bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-2xl text-slate-500 max-w-md w-full transform origin-center'
        >
            <h1 className='text-center text-2xl text-slate-800 font-extrabold tracking-tight'>
              Recruiter {state}
            </h1>
            <p className='text-xs text-slate-400 text-center mt-1.5 mb-6'>
              Welcome! Please fill in details to manage listings
            </p>

            { state === 'Sign Up' && isTextDataSubmitted
                ? <>
                    <div className='flex flex-col items-center gap-4 my-6'>
                        <label htmlFor='image' className='cursor-pointer group relative'>
                            <div className='w-20 h-20 rounded-full border-2 border-dashed border-indigo-200 group-hover:border-indigo-500 flex items-center justify-center overflow-hidden transition-colors duration-200'>
                                <img className='w-full h-full object-cover' src={image ? URL.createObjectURL(image) : assets.upload_area} alt='' />
                            </div>
                            <input onChange={e => setImage(e.target.files[0])} type='file' id='image' hidden/>
                        </label>
                        <p className='text-xs font-semibold text-slate-500 text-center'>
                          Upload Company Logo
                        </p>
                    </div>
                </>

                : <>
                <>
                {state !== 'Login' && (
                    <div className='border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 px-4 py-2.5 flex items-center gap-3 rounded-2xl mt-4 transition-all duration-200'>
                        <img className='opacity-55 w-4' src={assets.person_icon} alt='' />
                        <input className='outline-none text-sm text-slate-700 w-full bg-transparent' onChange={e => setName(e.target.value)} value={name} type='text' placeholder='Company Name' required/>
                    </div>
                )}
                
                <div className='border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 px-4 py-2.5 flex items-center gap-3 rounded-2xl mt-4 transition-all duration-200'>
                    <img className='opacity-55 w-4' src={assets.email_icon} alt='' />
                    <input className='outline-none text-sm text-slate-700 w-full bg-transparent' onChange={e => setEmail(e.target.value)} value={email} type='email' placeholder='Email Address' required/>
                </div>
                <div className='border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 px-4 py-2.5 flex items-center gap-3 rounded-2xl mt-4 transition-all duration-200'>
                    <img className='opacity-55 w-4' src={assets.lock_icon} alt='' />
                    <input className='outline-none text-sm text-slate-700 w-full bg-transparent' onChange={e => setPassword(e.target.value)} value={password} type='password' placeholder='Password' required/>
                </div>

                </>
                </>
            }

            {state === 'Login' && 
                <p className='text-xs text-indigo-600 hover:text-indigo-500 font-semibold mt-3 text-right cursor-pointer transition-colors duration-150'>
                  Forgot Password?
                </p>
            }

            <button type='submit' className='bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3 rounded-2xl w-full mt-6 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all duration-200 active:scale-[0.98]'>
                {state === 'Login' ? 'Login' : isTextDataSubmitted ? 'Create Account' : 'Next'}
            </button>
            
            {
                state === 'Login' 
                ? <p className='mt-5 text-center text-xs text-slate-500'>Don't have an account? <span className='text-indigo-600 font-bold hover:text-indigo-500 cursor-pointer transition-colors duration-150' onClick={() => setState('Sign Up')}>Sign Up</span></p>
                : <p className='mt-5 text-center text-xs text-slate-500'>Already have an account? <span className='text-indigo-600 font-bold hover:text-indigo-500 cursor-pointer transition-colors duration-150' onClick={() => setState('Login')}>Login</span></p>
            }

            <button 
              type="button" 
              onClick={e => setShowRecruiterLogin(false)} 
              className='absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors duration-150 cursor-pointer'
            >
              <img src={assets.cross_icon} alt='' className='w-2.5 opacity-60' />
            </button>
            
        </form>
    </div>
  )
}

export default RecruiterLogin
