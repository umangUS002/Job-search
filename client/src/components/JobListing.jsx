import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets, JobCategories, JobLocations } from '../assets/assets'
import JobCard from './JobCard';

function JobListing() {

  const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  const [filteredJobs, setFilteredJobs] = useState(jobs);

  const handleCategoryChange = (category) => {
    setSelectedCategories(
      prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const handleLocationChange = (location) => {
    setSelectedLocations(
      prev => prev.includes(location) ? prev.filter(c => c !== location) : [...prev, location]
    )
  }

  useEffect(() => {
    const matchesCategory = job => selectedCategories.length === 0 || selectedCategories.includes(job.category)
    const matchesLocation = job => selectedLocations.length === 0 || selectedLocations.includes(job.location)
    const matchedTitle = job => searchFilter.title === "" || job.title.toLowerCase().includes(searchFilter.title.toLowerCase())
    const matchesSearchLocation = job => searchFilter.location === "" || job.location.toLowerCase().includes(searchFilter.location.toLowerCase())

    const newFilterJobs = jobs.slice().reverse().filter(
      job => matchesCategory(job) && matchesLocation(job) && matchedTitle(job) && matchesSearchLocation(job)
    )

    setFilteredJobs(newFilterJobs);
    setCurrentPage(1)
  }, [selectedCategories, selectedLocations, searchFilter, jobs])

  return (
    <div className='container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 md:py-8'>

      {/* SideBar */}
      <div className='w-full lg:w-1/4 bg-white px-4'>

        {/* Search Filter from Hero Component */}
        {
          isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
            <>
              <h3 className='font-medium text-lg mb-4'>Current Search</h3>
              <div className='mb-4 text-gray-600'>
                {searchFilter.title && (
                  <span className='inline-flex items-center gap-2.5 bg-blue-50 border-blue-200 px-4 py-1.5 rounded'>
                    {searchFilter.title}
                    <img className='cursor-pointer' src={assets.cross_icon} alt='' onClick={e => setSearchFilter(prev => ({ ...prev, title: "" }))} />
                  </span>
                )}
              </div>
              <div>
                {searchFilter.location && (
                  <span className='md:ml-2 inline-flex items-center gap-2.5 bg-red-50 border-red-200 px-4 py-1.5 rounded'>
                    {searchFilter.location}
                    <img className='cursor-pointer' src={assets.cross_icon} onClick={e => setSearchFilter(prev => ({ ...prev, location: "" }))} alt='' />
                  </span>
                )}
              </div>
            </>
          )
        }

        <button onClick={e => setShowFilter(prev => !prev)} className='px-6 py-1.5 mt-5 rounded border border-gray-400 lg:hidden'>
          {showFilter ? "Close" : "Filters"}
        </button>

        {/* Category Filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className='font-medium text-lg py-4'>Search by Category</h4>
          <ul className='space-y-4 text-gray-600'>
            {
              JobCategories.map((category, index) => (
                <li className='flex my-1 md:gap-3 gap-1 mr-4 md:mr-0 items-center'>
                  <input className='scale-125' type='checkbox' key={index}
                    onChange={() => handleCategoryChange(category)}
                    checked={selectedCategories.includes(category)}
                  />
                  {category}
                </li>
              ))
            }
          </ul>
        </div>

        {/* Location Filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className='font-medium text-lg py-4 pt-14'>Search by Location</h4>
          <ul className='space-y-4 text-gray-600'>
            {
              JobLocations.map((location, index) => (
                <li className='flex md:gap-3 my-1 gap-1 mr-4 md:mr-0 items-center'>
                  <input className='scale-125' type='checkbox' key={index}
                    onChange={() => handleLocationChange(location)}
                    checked={selectedLocations.includes(location)}
                  />
                  {location}
                </li>
              ))
            }
          </ul>
        </div>
      </div>

      {/* Job Listings */}
      <section className='w-full lg:w-3/4 text-gray-800 max-lg:px-4'>
        <h3 className='font-medium text-3xl py-2' id='job-list'>Latest Jobs</h3>
        <p className='mb-8'>Get your desired job from Job Companies</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {filteredJobs.slice((currentPage - 1) * 6, currentPage * 6).map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className='flex flex-col items-center justify-center mt-10 gap-6'>

            {/* First Line: Navigation Arrows */}
            <div className='flex items-center space-x-8'>
              <a href='#job-list'>
                <img
                  className='cursor-pointer'
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  src={assets.left_arrow_icon}
                  alt='Previous'
                />
              </a>
              <a href='#job-list'>
                <img
                  className='cursor-pointer'
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredJobs.length / 6)))}
                  src={assets.right_arrow_icon}
                  alt='Next'
                />
              </a>
            </div>

            {/* Second Line: Page Numbers */}
            <div className='flex flex-wrap items-center justify-center gap-2'>
              {Array.from({ length: Math.ceil(filteredJobs.length / 6) }).map((_, index) => (
                <a href='#job-list' key={index}>
                  <button
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded transition-colors ${currentPage === index + 1
                        ? 'bg-blue-100 text-blue-500 border-blue-200'
                        : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {index + 1}
                  </button>
                </a>
              ))}
            </div>

          </div>
        )}

      </section>
    </div>
  )
}

export default JobListing
