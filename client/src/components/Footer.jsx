import React from 'react'
import { assets } from '../assets/assets'
import BrandLogo from './BrandLogo'

function Footer() {
  return (
    <div className='border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-transparent py-4 mt-16'>
      <div className='container px-4 2xl:px-20 mx-auto flex flex-col sm:flex-row items-center justify-between gap-6'>
        <BrandLogo className="transform scale-90 origin-left" />
        <p className='flex-1 border-l border-slate-200 dark:border-slate-800 pl-6 text-sm text-slate-400 font-medium max-sm:hidden'>
          Copyright &copy; Umang Srivastava | All rights reserved.
        </p>
        <div className='flex gap-3'>
          <a href="#" className='hover:opacity-85 transition-opacity duration-200 dark:brightness-90'>
            <img width={38} src={assets.facebook_icon} alt="Facebook" />
          </a>
          <a href="#" className='hover:opacity-85 transition-opacity duration-200 dark:brightness-90'>
            <img width={38} src={assets.instagram_icon} alt="Instagram" />
          </a>
          <a href="#" className='hover:opacity-85 transition-opacity duration-200 dark:brightness-90'>
            <img width={38} src={assets.twitter_icon} alt="Twitter" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Footer
