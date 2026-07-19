import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import gsap from 'gsap';

function CoverLetterModal({ jobId, jobTitle, companyName, onClose }) {
  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [copied, setCopied] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    gsap.fromTo(modalRef.current,
      { scale: 0.9, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' }
    );

    fetchCoverLetter();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchCoverLetter = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/jobs/${jobId}/cover-letter`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCoverLetter(data.coverLetter);
      } else {
        toast.error(data.message);
        onClose();
      }
    } catch (error) {
      toast.error('Failed to generate cover letter: ' + error.message);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    // Strip markdown chars when copying or copy direct text
    const cleanText = coverLetter
      .replace(/[#*`_]/g, '') // remove simple md characters
      .trim();

    navigator.clipboard.writeText(cleanText || coverLetter);
    setCopied(true);
    toast.success('Cover letter copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-slate-900/55 flex justify-center items-center p-4 transition-all duration-300">
      <div 
        ref={modalRef}
        className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl text-slate-700 max-w-xl w-full h-[75vh] flex flex-col overflow-hidden transform origin-center"
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/20">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-1.5">
              <span className="p-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm">✉️</span>
              AI Tailored Cover Letter
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Prepared for {jobTitle} at {companyName || 'Company'}
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-650"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-semibold">Generating your tailored cover letter...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm text-slate-750 font-serif leading-relaxed text-sm whitespace-pre-wrap select-text">
                {coverLetter}
              </div>
            </div>

            {/* Footer Panel */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
              
              <button 
                onClick={handleCopy}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{copied ? '✓ Copied' : '📋 Copy Letter'}</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default CoverLetterModal;
