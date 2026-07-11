import React from 'react'
import { assets } from '../assets/assets'

function AppDownload() {
  return (
    <div className='container px-4 2xl:px-20 mx-auto my-24'>
      <div className='relative bg-gradient-to-br from-indigo-50/70 via-slate-50 to-violet-50/60 p-12 sm:p-20 lg:p-28 rounded-3xl border border-indigo-100/50 shadow-sm overflow-hidden flex flex-col justify-center min-h-[350px]'>
        
        {/* Subtle decorative background circles */}
        <div className='absolute -top-10 -right-10 w-44 h-44 bg-indigo-200/20 rounded-full blur-xl pointer-events-none'></div>

        <div className='z-10 relative max-w-lg'>
            <h1 className='text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6 leading-tight'>
              Download Mobile App for <span className='bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent'>Better Experience</span>
            </h1>
            <p className='text-slate-500 mb-8 text-sm sm:text-base leading-relaxed'>
              Access active listings, track applications, and receive instant notifications. Available on your favorite app stores.
            </p>
            <div className='flex gap-4 flex-wrap'>
                <a className='hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 inline-block shadow-sm hover:shadow-md rounded-lg overflow-hidden' href="#">
                    <img className='h-12' src={assets.play_store} alt="Google Play Store" />
                </a>
                <a className='hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 inline-block shadow-sm hover:shadow-md rounded-lg overflow-hidden' href="#">
                    <img className='h-12' src={assets.app_store} alt="App Store" />
                </a>
            </div>
        </div>
        <div className='z-0 max-lg:hidden'>
            <img className='absolute w-72 right-12 bottom-0 lg:mr-24 hover:translate-y-2 transition-transform duration-500 ease-out' src={assets.app_main_img} alt="Mobile App Demo" />
        </div>
      </div>
    </div>
  )
}

export default AppDownload
