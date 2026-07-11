import React, { useContext, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import gsap from 'gsap'

function Hero() {

    const {setSearchFilter, setIsSearched} = useContext(AppContext);

    const titleRef = useRef(null);
    const locationRef = useRef(null);
    const heroRef = useRef(null);

    const onSearch = () => {
        setSearchFilter({
            title: titleRef.current.value,
            location: locationRef.current.value
        })
        setIsSearched(true);
    }

    useEffect(() => {
        const tl = gsap.timeline();
        // Fade in title, subtitle, and search container sequentially
        tl.fromTo(heroRef.current.querySelectorAll('.hero-fade'),
            { opacity: 0, y: 35 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power4.out' }
        );
        // Stagger in trusted logos
        tl.fromTo(heroRef.current.querySelectorAll('.partner-logo'),
            { opacity: 0, y: 15, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.4)' },
            '-=0.4'
        );
    }, []);

  return (
    <div ref={heroRef} className='container 2xl:px-20 mx-auto my-10 px-4'>
      {/* Premium Dark Gradient Container */}
      <div className='relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-20 px-6 md:px-12 text-center rounded-3xl overflow-hidden shadow-2xl border border-slate-800/60'>
        
        {/* Glow Ambient Blobs */}
        <div className='absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none'></div>
        <div className='absolute -bottom-16 -right-16 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none'></div>

        <h2 className='hero-fade text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight max-w-3xl mx-auto'>
          Your Next Big Career Move <span className='bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent'>Starts Here</span>
        </h2>
        
        <p className='hero-fade mb-10 max-w-xl mx-auto text-sm sm:text-base text-slate-300 font-light leading-relaxed px-2'>
          Explore the best job opportunities from global companies and take the next step toward your future with ApexHire.
        </p>

        {/* Glassmorphic Search Bar */}
        <div className='hero-fade flex flex-col md:flex-row items-center gap-3 backdrop-blur-lg bg-white/10 border border-white/15 p-2 rounded-2xl md:rounded-full max-w-3xl mx-auto shadow-xl'>
          
          <div className='flex items-center flex-1 w-full px-4 py-2 border-b border-white/10 md:border-b-0 md:border-r md:border-white/10'>
              <img className='h-5 opacity-70 filter invert' src={assets.search_icon} alt='' />
              <input 
                type='text' 
                placeholder='Search for Job Title or Category...' 
                className='text-white placeholder-slate-400 text-sm ml-3 bg-transparent outline-none w-full' 
                ref={titleRef}
              />
          </div>

          <div className='flex items-center flex-1 w-full px-4 py-2'>
              <img className='h-5 opacity-70 filter invert' src={assets.location_icon} alt='' />
              <input 
                type='text' 
                placeholder='Location...' 
                className='text-white placeholder-slate-400 text-sm ml-3 bg-transparent outline-none w-full' 
                ref={locationRef}
              />
          </div>

          <button 
            onClick={onSearch} 
            className='w-full md:w-auto bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 shadow-md shadow-cyan-900/20 text-white px-8 py-3 rounded-xl md:rounded-full font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
          >
            Search
          </button>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className='border border-slate-100 bg-white/50 backdrop-blur-md shadow-sm mx-1 mt-8 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-16'>
        <p className='font-semibold text-slate-400 text-sm uppercase tracking-wider max-md:mb-2'>Trusted By Leaders:</p>
        <div className='flex justify-center gap-8 lg:gap-14 flex-wrap items-center'>
            <img className='partner-logo h-6 opacity-45 hover:opacity-100 transition-opacity duration-200 object-contain' src={assets.microsoft_logo} alt="Microsoft" />
            <img className='partner-logo h-6 opacity-45 hover:opacity-100 transition-opacity duration-200 object-contain' src={assets.walmart_logo} alt="Walmart" />
            <img className='partner-logo h-6 opacity-45 hover:opacity-100 transition-opacity duration-200 object-contain' src={assets.accenture_logo} alt="Accenture" />
            <img className='partner-logo h-6 opacity-45 hover:opacity-100 transition-opacity duration-200 object-contain' src={assets.samsung_logo} alt="Samsung" />
            <img className='partner-logo h-6 opacity-45 hover:opacity-100 transition-opacity duration-200 object-contain' src={assets.amazon_logo} alt="Amazon" />
            <img className='partner-logo h-6 opacity-45 hover:opacity-100 transition-opacity duration-200 object-contain' src={assets.adobe_logo} alt="Adobe" />
        </div>
      </div>

    </div>
  )
}

export default Hero
