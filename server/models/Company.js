import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },

  image: { type: String },

  email: { type: String, sparse: true },

  password: { type: String }

}, { timestamps: true });

export default mongoose.model("Company", companySchema);