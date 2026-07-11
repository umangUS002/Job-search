import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    resume: {type: String},
    resumeData: {
        skills: { type: [String], default: [] },
        projects: [{
            title: String,
            description: String
        }],
        education: [{
            degree: String,
            school: String,
            year: String
        }],
        experience: [{
            role: String,
            company: String,
            duration: String
        }]
    },
    image: {type: String, required: true}
})

const User = mongoose.model('User', userSchema);

export default User;