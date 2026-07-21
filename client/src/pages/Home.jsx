import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobListing from '../components/JobListing'
import { HomeStats, HomeFeatures, HowItWorks } from '../components/HomeFeatures'
import AiCoachDemo from '../components/AiCoachDemo'
import Footer from '../components/Footer'

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      {/* <HomeStats /> */}
      <HomeFeatures />
      <JobListing />
      <HowItWorks />
      <AiCoachDemo />
      <Footer />
    </div>
  )
}

export default Home
