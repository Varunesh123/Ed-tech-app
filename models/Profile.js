import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    gender: {
        type: String
    },
    dateOfBirth: {
        type: String
    },
    contactNumber: {
        type: Number,
        trim: true
    },
    about: {
        type: String,
        trim: true
    }
})
export default mongoose.model("Profile", profileSchema)