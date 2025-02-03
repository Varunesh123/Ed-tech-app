import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required: true,
        trim: true
    },
    lastName : {
        type : String,
        required: true,
        trim: true
    },
    email : {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        required: true,
        enum : ["Admin", "Student", "Instructor"]
    },
    active: {
        type: Boolean,
        default: true
    },
    approved: {
        type: Boolean,
        default: true
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile"
    },
    course : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    token: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    image: {
        type: String,
        required: true
    },
    courseProgress : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress"
        }
    ]
},{ timestamps: true })

export default mongoose.model("User", userSchema)