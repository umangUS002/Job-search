import express from 'express';
import { filterJobs, getJobById, getJobs, saveScrapedJobs } from '../controllers/jobController.js';

const jobRouter = express.Router();

jobRouter.get('/', getJobs);
jobRouter.get("/filter", filterJobs);

jobRouter.get('/:id', getJobById);

//scraped jobs
jobRouter.post("/scraped", saveScrapedJobs);

//filter jobs

export default jobRouter;