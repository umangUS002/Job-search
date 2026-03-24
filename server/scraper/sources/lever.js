import axios from "axios";
import { detectLevel, detectCategory } from "../utils/parser.js";

export async function scrapeLever(company) {

  try {

    const url = `https://api.lever.co/v0/postings/${company}?mode=json`;

    const res = await axios.get(url);

    const jobs = res.data.map(job => ({

      title: job.text,

      description: job.description || "",

      location: job.categories?.location || "Remote",

      category: detectCategory(job.text),

      level: detectLevel(job.text),

      salary: null,

      date: new Date(job.createdAt).getTime(),

      company,

      url: job.hostedUrl

    }));

    return jobs;

  } catch (err) {

    console.log("Lever error:", company);

    return [];

  }

}