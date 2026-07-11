import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

function BrandLogo({ onClick, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Elegant stagger entry animation for logo parts
    const targets = containerRef.current.querySelectorAll('.logo-anim');
    gsap.fromTo(targets, 
      { 
        opacity: 0, 
        y: -15,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.8, 
        stagger: 0.1, 
        ease: 'back.out(1.7)' 
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}
    >
      {/* Dynamic Animated SVG Icon */}
      <svg
        className="w-10 h-10 logo-anim"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="apexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" /> {/* Modern Indigo */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* Vibrant Cyan */}
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Glow effect under the logo */}
        <circle cx="50" cy="50" r="28" fill="url(#apexGrad)" opacity="0.15" filter="url(#logoGlow)" />

        {/* Abstract double-peak "A" shape with a cybernetic node */}
        <path
          d="M20 75 L50 20 L80 75 M35 52 L65 52"
          stroke="url(#apexGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="20" r="9" fill="#06b6d4" className="animate-pulse" />
      </svg>

      {/* Brand Typography */}
      <span className="text-2xl font-extrabold tracking-tight logo-anim flex items-center">
        <span className="bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
          Apex
        </span>
        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent ml-0.5">
          Hire
        </span>
      </span>
    </div>
  );
}

export default BrandLogo;
