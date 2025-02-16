import sendResponse from "../utlis/sendResponse.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { uploadImageOnCloudinary } from "../utlis/imageUploader.js";
import { convertSecondsToDuration } from "../utlis/secToDuration.js";
import CourseProgress from "../models/CourseProgess.js";

const updateProfile = async(req, res) => {
    try {
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        const id = req.user.id;

        if(!id || !contactNumber || !gender){
            return sendResponse(res, 400, false, "All fields are required");
        }
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();

        return sendResponse(res, 200, true, "Profile updated successfully", profileDetails);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to update Profile");
    }
}
const deleteProfile = async(req, res) => {
    try {
        const {userId} = req.user.id;
        const userDetails = await User.findById(userId);
        if(!userDetails){
            return sendResponse(res, 400, false, "User not found");
        }
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});

        await User.findByIdAndDelete({_id: userId});

        return sendResponse(res, 200, true, "User deleted successfully")
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to delete profile")
    }
}
const getAllUserDetails = async(req, res) => {
    try {
        const userId = req.user.id;
        const userDetails = await User.findById(userId).populate("additionalDetails").exec();

        return sendResponse(res, 200, true, "All details of user fetched successfully", userDetails);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to fetched all user");
    }
}
const updateDisplayPicture = async(req, res) => {
    try {
        const displayPic = req.files.displayPicture;
        const userId = req.user.id;
        const image = await uploadImageOnCloudinary(
                            displayPic,
                            process.env.FOLDER_NAME,
                            1000,
                            1000
                        )
        console.log(image);
        const updateProfile = await User.findByIdAndUpdate(
            {_id: userId},
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updateProfile
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const getEnrolledCourses = async(req, res) => {
    try {
        const userId = req.user.id;
        let userDetails = await User.findOne({
                                _id: userId,
                            })
                            .populate({
                                path: "courses",
                                populate: {
                                    path: "courseContent",
                                    populate: {
                                        path: "subSection"
                                    }
                                }
                            })
                            .exec();
        userDetails = userDetails.toObject();
        var SubsectionLength = 0;
        for(var i=0; i < userDetails.courses.length; j++){
            let totalDurationInSeconds = 0;
            SubsectionLength = 0;
            for(var j=0; j < userDetails.courses[i].courseContent.length; j++){
                totalDurationInSeconds += userDetails.courses[i]
                                            .courseContent[j]
                                            .SubsectionLength
                                            .reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                
                userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds)
                Subsection += userDetails.courses[i].courseContent[j].subSection.length
            } 
            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if(SubsectionLength === 0){
                userDetails.courses[i].progressPercentage = 100
            } else {
                const multiplier = Math.pow(10, 2)
                userDetails.courses[i].progressPercentage = Math.round((courseProgressCount / SubsectionLength) * 100 * multiplier) / multiplier
            }
        }
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const instructorDashboard = async(req, res) => {
    try {
        const courseDetails = await CourseProgress.find({instructor: req.user.id})

        const courseData = courseDetails.map((course) => {
            const totalStudentEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentEnrolled * course.price

            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudentEnrolled,
                totalAmountGenerated
            }
            return courseDataWithStats
        })
        res.status(200).json({
            courses: courseData
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: " Internal Server Error" })
    }
}
export {
    updateProfile,
    deleteProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses
}