import express from 'express';
import { getJobById, getJobs, saveScrapedJobs } from '../controllers/jobController.js';

const jobRouter = express.Router();

jobRouter.get('/', getJobs);
jobRouter.get('/:id', getJobById);

//scraped jobs
jobRouter.post("/scraped", saveScrapedJobs);

export default jobRouter;