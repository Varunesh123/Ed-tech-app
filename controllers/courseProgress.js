import sendResponse from "../utlis/sendResponse.js";
import Subsection from '../models/SubSection.js';
import CourseProgress from '../models/CourseProgess.js';

const updateCourseProgress = async(req, res) => {
    try {
        const {courseId, subsectionId} = req.body;
        const userId = req.user.id;

        const subsection = await Subsection.findById(subsectionId);
        if(!subsection){
            return sendResponse(res, 404, false, "Invalid Subsection");
        }
        let courseProgress = await CourseProgress.findOne({courseID: courseId, userId: userId});

        if(!courseProgress){
            return sendResponse(res, 404, false, "Course progress doest not exist");
        } else {
            if(courseProgress.completedVideos.includes(subsectionId)){
                return sendResponse(res, 400, false, "Subsection already created");
            }
            courseProgress.completedVideos.push(subsectionId);
        }
        await courseProgress.save();

        return sendResponse(res, 200, true, "Course progress updated");
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, error.message);
    }
}
export {
    updateCourseProgress
}