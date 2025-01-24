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
module.exports = mongoose.model("Profile", profileSchema)