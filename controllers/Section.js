import sendResponse from "../utlis/sendResponse.js";
import Section from "../models/Section.js";
import Course from "../models/Course.js";

const createSection = async(req, res) => {
    try {
        const {sectionName, courseId} = req.body;
        if(!sectionName || !courseId){
            return sendResponse(res, 400, false, "All fields are required");
        }
        const newSection = await Section.create({sectionName});

        const updateCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push: {
                                                    courseContent: newSection._id,
                                                },
                                            },
                                            {new: true}
                                        ).populate({
                                            path: "courseContent",
                                            papulate: {
                                                path: "subsection"
                                            }
                                        }).exec();

        return sendResponse(res, 200, true, "Section created successfully");
    } catch (error) {
        return sendResponse(res, 500, false, "Unable to create Section", error.message);
    }
}
const updateSection = async(req, res) => {
    try {
        const {sectionName, sectionId} = req.body;
        if(!sectionId || !sectionName){
            return sendResponse(res, 400, false, "All fields are required");
        }
        const section = await Section.findByIdAndUpdate(
                                        sectionId,
                                        {sectionName},
                                        {new: true}
                                    );
        return sendResponse(res, 200, true, section);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to update Section");
    }
}
const deleteSection = async(req, res) => {
    try {
        const {sectionId} = req.params;
        if(!sectionId){
            return sendResponse(res, 400, false, "Section id is required");
        }
        await Section.findByIdAndDelete(sectionId);

        return sendResponse(res, 200, true, "Section deleted successfully");
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to delete Section");
    }
}
export {
    createSection,
    updateSection,
    deleteSection
}