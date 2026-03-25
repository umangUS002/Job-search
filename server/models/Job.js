import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  category: String,
  level: String,
  salary: Number,
  date: Number,
  skills: [String],
  visible: { type: Boolean, default: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  company: String,
  url: { type: String, unique: true }
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);

export default Job;