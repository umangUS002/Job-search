import React, { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

function AddJob() {

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Bangalore');
  const [category, setCategory] = useState('Programming');
  const [level, setLevel] = useState('Begineer Level');
  const [salary, setSalary] = useState(0);

  const {backendUrl, companyToken} = useContext(AppContext);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const onSubmitHandler = async(e) => {
    e.preventDefault();

    try {
      
      const description = quillRef.current.root.innerHTML;

      const {data} = await axios.post(backendUrl + '/api/company/post-job', 
        {title, description, location, salary, category, level},
        {headers: {token: companyToken}}
      )

      if(data.success){
        toast.success(data.message);
        setTitle('')
        setSalary(0)
        quillRef.current.root.innerHTML = ""
      } else {
        toast.error(data.message)
      }

    } catch (error) {
        toast.error(error.message)
    }
  }

  useEffect(()=>{
    //Initiate Quill Only Once
    if(!quillRef.current && editorRef.current){
      quillRef.current = new Quill(editorRef.current,{
        theme: 'snow',
      })
    }
  },[])

  return (
    <form onSubmit={onSubmitHandler} className='container p-6 sm:p-8 flex flex-col w-full items-start gap-4 max-w-3xl mx-auto bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm'>

      <div>
        <h2 className='text-xl font-bold text-slate-800 dark:text-slate-100'>Create Job Posting</h2>
        <p className='text-xs text-slate-400 dark:text-slate-500 mt-1 mb-6'>Enter the role details to publish a new position on the job board.</p>
      </div>

      <div className='w-full'>
        <p className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Job Title</p>
        <input type='text' placeholder='e.g., Senior Full Stack Engineer' onChange={e => setTitle(e.target.value)}
          value={title} required className='w-full max-w-lg px-4 py-2.5 border border-slate-250 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl text-sm font-medium transition-all duration-150 text-slate-850 dark:text-slate-100 bg-white dark:bg-slate-950/40'
        />
      </div>

      <div className='w-full max-w-lg'>
        <p className='my-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Job Description</p>
        <div ref={editorRef} className='rounded-xl border border-slate-250 dark:border-slate-800 overflow-hidden text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950/40 w-full'>
          
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mt-2'>
        <div>
          <p className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Job Category</p>
          <select className='w-full px-4 py-2.5 border border-slate-250 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl text-sm font-medium transition-all text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950/40' onChange={e => setCategory(e.target.value)} >
            {JobCategories.map((category, index) =>(
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Job Location</p>
          <select className='w-full px-4 py-2.5 border border-slate-250 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl text-sm font-medium transition-all text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950/40' onChange={e => setLocation(e.target.value)} >
            {JobLocations.map((location, index) =>(
              <option key={index} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Job Level</p>
          <select className='w-full px-4 py-2.5 border border-slate-250 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl text-sm font-medium transition-all text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950/40' onChange={e => setLevel(e.target.value)} >
              <option value="Begineer Level">Beginner Level</option>
              <option value="Intermediate Level">Intermediate Level</option>
              <option value="Senior Level">Senior Level</option>
          </select>
        </div>
      </div>

      <div className='w-full max-w-[200px] mt-2'>
        <p className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>Job Salary (Annual)</p>
        <input min={0} className='w-full px-4 py-2.5 border border-slate-250 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl text-sm font-medium transition-all text-slate-850 dark:text-slate-105 bg-white dark:bg-slate-950/40' onChange={e => setSalary(e.target.value)} value={salary} type='Number' placeholder='e.g., 85000'/>
      </div>

      <button className='bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl cursor-pointer text-xs transition-all shadow-md shadow-indigo-600/10 hover:shadow-lg active:scale-95 mt-6'>Publish Job</button>
    
    </form>
  )
}

export default AddJob
