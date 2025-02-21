import sendResponse from "../utlis/sendResponse.js";
import uploadImageOnCloudinary from '../utlis/imageUploader.js';
import Subsection from "../models/SubSection.js";
import Section from "../models/Section.js";
import { updateSection } from "./Section.js";

const createSubsection = async(req, res) => {
    try {
        const {sectionId, title, description} = req.body;
        const video = req.files.videoFile;
        console.log("video",video)
        if(!sectionId || !title || !description || !video){
            return sendResponse(res, 400, false, "All fields are required");
        }
        console.log("filename", process.env.FOLDER_NAME);
        const uploadsDetails = await uploadImageOnCloudinary(video, process.env.FOLDER_NAME);
        console.log("uploades on cloud", uploadsDetails)
        const subsectionDetails = await Subsection.create({
            title: title,
            timeDuration: `${uploadsDetails.duration}`,
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
        const {title, description, subSectionId} = req.body;
        const video = req.files?.videoFile;

        if(!subSectionId){
            return sendResponse(res, 400, false, "Subsection id is required");
        }
        if(!title && !description && !video){
            return sendResponse(res, 400, false, "At least on fields is required");
        }
        let updateVideo = '';
        if(video){
            updateVideo = await uploadImageOnCloudinary(video, process.env.FOLDER_NAME);
        }
        const updateFields = {
            ...(title && {title}),
            ...(description && {description}),
            ...(updateVideo && `${updateVideo.duration}`),
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