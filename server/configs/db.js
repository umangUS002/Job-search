import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config(); 
console.log("Mongo URI:", process.env.MONGODB_URI);

// Function to connect to MongoDB database
const connectDB = async() => {

    mongoose.connection.on('connected', () => console.log('Database Connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}/JobSearch`)

}

export default connectDB;