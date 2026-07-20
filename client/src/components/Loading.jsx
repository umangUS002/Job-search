import React from 'react'

function Loading() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-slate-50/30 gap-4'>
      <div className='relative w-16 h-16 flex items-center justify-center'>
        {/* Pulsing outer ring */}
        <div className='absolute inset-0 border-4 border-indigo-600/10 rounded-full animate-ping'></div>
        {/* Spinning inner gradient ring */}
        <div className='w-full h-full border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin'></div>
      </div>
      <p className='text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse mt-2'>Loading opportunities...</p>
    </div>
  )
}

export default Loading
