import express from 'express';
import { filterJobs, getJobById, getJobs, saveScrapedJobs, searchJobsES, analyzeJobMatch, generateCoverLetter } from '../controllers/jobController.js';

const jobRouter = express.Router();

jobRouter.get('/', getJobs);
jobRouter.get("/filter", filterJobs);

jobRouter.get('/:id', getJobById);
jobRouter.get('/:id/analyze', analyzeJobMatch);
jobRouter.get('/:id/cover-letter', generateCoverLetter);

//scraped jobs
jobRouter.post("/scraped", saveScrapedJobs);
//filter jobs
jobRouter.get("/search-es", searchJobsES);

export default jobRouter;