import Category from '../models/Category.js';
import sendResponse from '../utlis/sendResponse.js';

const createCategory = async(req, res) => {
    try {
        const { name, description } = req.body;

        if(!name || !description){
            return sendResponse(res, 400, false, "All fields are required");
        }
        // Create entry in DB
        const categoryDetails = await Category.create({
            name: name,
            description: description
        });
        console.log(categoryDetails);

        return sendResponse(res, 200, true, "Category created successfully");
    } catch (error) {
        return sendResponse(res, 500, false, error.message)
    }
}
const showAllCategory = async(req, res) => {
    try {
        const allCategory = await Category.find({}, {name: true, description: true});

        return sendResponse(res, 200, true, "All categories returned successfully", allCategory);
    } catch (error) {
        return sendResponse(res, 500, false, error.message);
    }
}
// TODO: CategoryPageDetails
export {
    createCategory,
    showAllCategory
}