import Job from "../models/Job.js"


// Get all jobs
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ visible: true }).
            populate({ path: 'companyId', select: '-password' })

        res.json({ success: true, jobs });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get a single job by id
export const getJobById = async (req, res) => {
    try {

        const { id } = req.params
        const job = await Job.findById(id)
            .populate({
                path: 'companyId',
                select: '-password'
            })

        if (!job) {
            return res.json({ success: false, message: 'Job Not Found' });
        }

        res.json({ success: true, job });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const saveScrapedJobs = async (req, res) => {
    try {

        const existing = await Job.findOne({ link: req.body.link });

        if (existing) {
            return res.status(200).json({ message: "Job already exists" });
        }

        const job = new Job(req.body);
        await job.save();

        res.status(201).json(job);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}