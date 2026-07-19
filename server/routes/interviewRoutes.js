import express from 'express';
import { startInterview, submitAnswer } from '../controllers/interviewController.js';

const interviewRouter = express.Router();

interviewRouter.post('/start', startInterview);
interviewRouter.post('/answer', submitAnswer);

export default interviewRouter;
