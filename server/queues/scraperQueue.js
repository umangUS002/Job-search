import { Queue } from "bullmq";
import { redisConnection } from "../configs/redis.js";

const scraperQueue = new Queue("scraperQueue", {
  connection: redisConnection
});

export default scraperQueue;