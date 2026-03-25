
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import { assets } from "../assets/assets";

import kconvert from "k-convert";
import moment from "moment";
import parse from "html-react-parser";
import he from "he";

import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [JobData, setJobData] = useState(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  const {
    jobs,
    backendUrl,
    userData,
    userApplications,
    fetchUserApplications
  } = useContext(AppContext);

  // fetch single job
  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`);

      if (data.success) {
        setJobData(data.job);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // apply to job
  const applyHandler = async () => {
    try {
      if (!userData) {
        return toast.error("Login to Apply");
      }

      if (!userData.resume) {
        navigate("/applications");
        return toast.error("Upload Resume to Apply");
      }

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/users/apply`,
        { jobId: JobData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // check if user already applied
  const checkAlreadyApplied = () => {
    const hasApplied = userApplications.some(
      (item) => item?.jobId?._id === JobData?._id
    );

    setIsAlreadyApplied(hasApplied);
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (JobData && userApplications.length > 0) {
      checkAlreadyApplied();
    }
  }, [JobData, userApplications]);

  if (!JobData) return <Loading />;

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto">

        {/* Job Header */}
        <div className="bg-white text-black rounded-lg w-full">

          <div className="flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl">

            <div className="flex flex-col md:flex-row items-center gap-4">

              <img
                className="h-12 w-12 object-contain bg-white p-1 rounded border"
                src={JobData.companyId?.image || "/company.png"}
                alt="company"
              />

              <div className="text-center md:text-left text-neutral-700">

                <h1 className="text-2xl sm:text-4xl font-medium">
                  {JobData.title}
                </h1>

                <div className="flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2">

                  <span className="flex items-center gap-1">
                    <img src={assets.suitcase_icon} alt="" />
                    {JobData.companyId?.name || "Company Name"}
                  </span>

                  <span className="flex items-center gap-1">
                    <img src={assets.location_icon} alt="" />
                    {JobData.location || "Remote"}
                  </span>

                  <span className="flex items-center gap-1">
                    <img src={assets.person_icon} alt="" />
                    {JobData.level || "Not specified"}
                  </span>

                  <span className="flex items-center gap-1">
                    <img src={assets.money_icon} alt="" />
                    CTC:{" "}
                    {JobData.salary
                      ? kconvert.convertTo(JobData.salary)
                      : "Not disclosed"}
                  </span>

                </div>
                <div className="flex gap-2 flex-wrap">
                  {JobData.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-200 px-2 mt-2 py-1 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center text-end text-sm max-md:text-center">

              {JobData.url?.startsWith("http") ? (
                // 🔗 Scraped job → external apply
                <a
                  href={JobData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 p-2.5 px-10 text-white rounded cursor-pointer inline-block text-center"
                >
                  Apply Externally
                </a>
              ) : (
                // 🧑‍💼 Admin job → internal apply
                <button
                  onClick={applyHandler}
                  disabled={isAlreadyApplied}
                  className={`p-2.5 px-10 text-white rounded cursor-pointer ${isAlreadyApplied ? "bg-green-600" : "bg-blue-600"
                    }`}
                >
                  {isAlreadyApplied ? "Already Applied" : "Apply Now"}
                </button>
              )}

              <p className="mt-1 text-gray-600">
                Posted{" "}
                {JobData.date
                  ? moment(JobData.date).fromNow()
                  : "Recently"}
              </p>

            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row justify-between items-start">

            {/* Job Description */}
            <div className="w-full lg:w-2/3">
              <h2 className="font-bold text-3xl mb-4">Job Description</h2>

              <div className="prose max-w-none">
                {JobData.description
                  ? parse(he.decode(JobData.description))
                  : "No description available"}
              </div>

              {JobData.url?.startsWith("http") ? (
                // 🔗 Scraped job → external apply
                <a
                  href={JobData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 p-2.5 px-10 mt-3 text-white rounded cursor-pointer inline-block text-center"
                >
                  Apply Externally
                </a>
              ) : (
                // 🧑‍💼 Admin job → internal apply
                <button
                  onClick={applyHandler}
                  disabled={isAlreadyApplied}
                  className={`p-2.5 px-10 text-white mt-3 rounded cursor-pointer ${isAlreadyApplied ? "bg-green-600" : "bg-blue-600"
                    }`}
                >
                  {isAlreadyApplied ? "Already Applied" : "Apply Now"}
                </button>
              )}

            </div>

            {/* More Jobs */}
            <div className="w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5">

              <h2 className="text-lg font-semibold">
                More Jobs from {JobData.companyId?.name || "Company"}
              </h2>

              {jobs
                .filter(
                  (job) =>
                    job?._id !== JobData?._id &&
                    job?.companyId?._id === JobData?.companyId?._id
                )
                .filter((job) => {
                  const appliedJobsIds = new Set(
                    userApplications.map((app) => app?.jobId?._id)
                  );

                  return !appliedJobsIds.has(job._id);
                })
                .slice(0, 4)
                .map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}

            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ApplyJob;
