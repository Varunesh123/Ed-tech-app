import Tag from '../models/Tag.js';
import sendResponse from '../utlis/sendResponse.js';

const createCourse = async(req, res) => {
    try {
        const { name, description } = req.body;

        if(!name || !description){
            return sendResponse(res, 400, false, "All fields are required");
        }
        // Create entry in DB
        const tagDetails = await Tag.create({
            name: name,
            description: description
        });
        console.log(tagDetails);

        return sendResponse(res, 200, true, "Tag created successfully");
    } catch (error) {
        return sendResponse(res, 500, false, error.message)
    }
}
const showAllCourse = async(req, res) => {
    try {
        const allTags = await Tag.find({}, {name: true, description: true});

        return sendResponse(res, 200, true, "All tags returned successfully", allTags);
    } catch (error) {
        return sendResponse(res, 500, false, error.message);
    }
}

export {
    createCourse,
    showAllCourse
}