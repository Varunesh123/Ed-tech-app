import sendResponse from "../utlis/sendResponse.js";
import uploadImageOnCloudinary from '../utlis/imageUploader.js';
import Subsection from "../models/SubSection.js";
import Section from "../models/Section.js";

const createSubsection = async(req, res) => {
    try {
        const {sectionId, title, timeDuration, description} = req.body;
        const video = req.files.videoFile;

        if(!sectionId || !title || !timeDuration || !description || !video){
            return sendResponse(res, 400, false, "All fields are required");
        }
        const uploadsDetails = await uploadImageOnCloudinary(video, process.env.FOLDER_NAME);

        const subsectionDetails = await Subsection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadsDetails.secure_url,
        });
        const updateSection = await Section.findByIdAndUpdate(
                                                {_id: sectionId},
                                                {
                                                    $push: {
                                                        subSection: subsectionDetails._id
                                                    }
                                                },
                                                {new: true}
                                            );
        return sendResponse(res, 200, true, "Subsection created successfully");
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to create subsection");
    }
}
const updateSubsection = async(req, res) => {
    try {
        const {title, description, timeDuration, subSectionId} = req.body;
        const video = req.files.videoFile;

        if(!subSectionId){
            return sendResponse(res, 400, false, "Subsection is required");
        }
        if(!title && !description && !timeDuration && !video){
            return sendResponse(res, 400, false, "At least on fields is required");
        }
        const updateVideo = await uploadImageOnCloudinary(video, process.env.FOLDER_NAME);

        const updateFields = {
            ...(title && {title}),
            ...(description && {description}),
            ...(timeDuration && {timeDuration}),
            ...Section(updateVideo && {updateVideo})
        }

        const updateSubsectionDetails = await Subsection.findByIdAndUpdate(
            subSectionId,
            { $set: updateFields },
            {new: true}
        );
        return sendResponse(res, 200, true, "Subsection updated successfully");
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to update subsection");
    }
}
const deleteSubsection = async(req, res) => {
    try {
        const {subsectionId} = req.body;
        if(!subsectionId){
            return sendResponse(res, 400, false, "Subsection id is required");
        }
        const section = await Subsection.findByIdAndDelete(subsectionId);

        return sendResponse(res, 200, true, "Subsection deleted successfully");
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to delete subsection");
    }
}
export {
    createSubsection,
    updateSubsection,
    deleteSubsection
}