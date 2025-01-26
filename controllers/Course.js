import sendResponse from "../utlis/sendResponse.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import uploadImageOnCloudinary from "../utlis/imageUploader.js";

const createCourse = async (req, res) => {
    try {
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail){
            return sendResponse(res, 400, false, "All fields are required");
        }
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details", instructorDetails);

        if(!instructorDetails){
            return sendResponse(res, 400, false, "Instructor details not found");
        }
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return sendResponse(res, 400, false, "Category detail is missing");
        }
        const thumbnailImage = await uploadImageOnCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true}
        );
        return sendResponse(res, 200, true, "Course created successfully", newCourse);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Failed to create Course");
    }
}

const showAllCourses = async(req, res) => {
    try {
        const allCourses = await Course.find({});

        return sendResponse(res, 200, true, "All Courses fetched successfully", allCourses);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to fetched all course");
    }
}

export {
    createCourse, 
    showAllCourses
}