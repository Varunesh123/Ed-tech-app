import sendResponse from "../utlis/sendResponse.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import uploadImageOnCloudinary from "../utlis/imageUploader.js";
import Section from "../models/Section.js";
import SubSection from "../models/SubSection.js";


const createCourse = async (req, res) => {
    try {
        const {
            courseName, 
            courseDescription, 
            whatYouWillLearn, 
            price, 
            tag, 
            category, 
            status,
            instructions
        } = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(
            !courseName || 
            !courseDescription || 
            !whatYouWillLearn || 
            !price ||  
            !thumbnail ||
            !tag ||
            !category
        ) {
            return sendResponse(res, 400, false, "All fields are required");
        }
        if(!status || status === undefined){
            status = "Draft";
        }
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {accountType: "Instructor"});
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
            tag: tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions
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
        await Category.findByIdAndUpdate(
            {_id: category},
            {
                $push: {
                    course: newCourse._id
                }
            },
            {new: true}
        )
        return sendResponse(res, 200, true, "Course created successfully", newCourse);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Failed to create Course");
    }
}
const showAllCourses = async(req, res) => {
    try {
        const allCourses = await Course.find(
            {},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        ).populate("instructor").exec();

        return sendResponse(res, 200, true, "All Courses fetched successfully", allCourses);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 404, false, "Unable to fetched all course");
    }
}
const editCourse = async(req, res) => {
    try {
        const {courseId} = req.user;
        const updates = req.body;

        const course = await Course.findById(courseId);

        if(!course){
            return sendResponse(res, 404, false, "Course not found");
        }
        if(req.files){
            console.log("thumbnail update");
            const thumbnail = req.files.thumbnailImage;
            const thumbnailImage = await uploadImageOnCloudinary(
                                        thumbnail,
                                        process.env.FOLDER_NAME
                                    )
            course.thumbnail = thumbnailImage.secure_url
        }
        for(const update in updates){
            if(updates.hasOwnProperty(update)){
                if(update === "tag" || update === "instructions"){
                    course[update] = JSON.parse(updates[update])
                } else {
                    course[update] = updates[update]
                }
            }
        }
        await course.save();

        const updatedCourse = await findOne({_id: courseId})
                                        .populate({
                                            path: "instructor",
                                            populate: {
                                                path: "addictionalDetails"
                                            }
                                        })
                                        .populate("category")
                                        .populate("ratingAndReviews")
                                        .populate({
                                            path: "courseContent",
                                            populate: {
                                                path: "subSection"
                                            }
                                        })
                                        .exec();

        return sendResponse(res, 201, true, updatedCourse);
    } catch (error) {
        console.log(error.message);
        return sendResponse(res, 500, false, "Unable to update course");
    }
}
const getCourseDetails = async(req, res) => {
    try {
        const { courseId } = req.body;
        const courseDetails = await Course.findOne({
                                    _id : courseId,
                                }) 
                                .populate({
                                    path: "instructor",
                                    populate: {
                                        path: "additionalDetails"
                                    }
                                })
                                .populate("category")
                                .populate("ratingAndReviews")
                                .populate({
                                    path: "courseContent",
                                    populate: {
                                        path: "subSection",
                                        select: "-videoUrl"
                                    }
                                })
                                .exec();
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`
            })
        }
        let totalDurationInseconds = 0;
        courseDetails.courseContent.forEach((content)=> {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInseconds += timeDurationInSeconds
            })
        })
        const totalDuration = convertSecondsToDuration(totalDurationInseconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const getFullCourseDEtails = async(req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;
        const courseDetails = await Course.findOne({
                                    _id : courseId,
                                }) 
                                .populate({
                                    path: "instructor",
                                    populate: {
                                        path: "additionalDetails"
                                    }
                                })
                                .populate("category")
                                .populate("ratingAndReviews")
                                .populate({
                                    path: "courseContent",
                                    populate: {
                                        path: "subSection",
                                        select: "-videoUrl"
                                    }
                                })
                                .exec();


        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`
            })
        }
        let totalDurationInseconds = 0;
        courseDetails.courseContent.forEach((content)=> {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInseconds += timeDurationInSeconds
            })
        })
        const totalDuration = convertSecondsToDuration(totalDurationInseconds)

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId
        });
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos ?
                courseProgressCount?.completedVideos : [],
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const getInstructorCourses = async(req, res) => {
    try {
        const instructorId = req.user.id

        const instructorCourses = await Course.find({
                                        intructor: instructorId,
                                    }).sort({ createdAt: -1})

        return res.status(200).json({
            success: true,
            data: instructorCourses
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message
        })
    }
}
const deleteCourse = async(req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message: "Course not found"
            })
        }
        const studentsEnrolled = course.studentsEnrolled

        for(const studentId of studentsEnrolled){
            await User.findByIdAndUpdate(
                studentId,
                {
                    $pull: {
                        courses: courseId
                    }
                }
            )
        }
        const courseSections = course.courseContent

        for(const sectionId of courseSections){
            const section = await Section.findById(sectionId);
            if(section){
                const subSections = section.subSection

                for(const subsectionId of subSections){
                    await SubSection.findByIdAndDelete(subsectionId)
                }
            }
            await Section.findByIdAndDelete(sectionId)
        }
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to Course delete",
            error: error.message
        })
    }
}
export {
    createCourse, 
    showAllCourses,
    editCourse,
    getCourseDetails,
    getFullCourseDEtails,
    getInstructorCourses,
    deleteCourse
}