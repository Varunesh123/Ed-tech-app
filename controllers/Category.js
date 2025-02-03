import Category from '../models/Category.js';
import sendResponse from '../utlis/sendResponse.js';
import Course from "../models/Course.js";

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
const categoryPageDetails = async(req, res) => {
    try {
        const { categoryId } = req.body;

        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();
        console.log(selectedCategory);
        
        if(!selectedCategory){
            console.log("category not found");
            return sendResponse(res, 404, false, "Category not found");
        }
        if(selectedCategory.courses.length === 0){
            return sendResponse(res, 404, false, "No course found for this category");
        }
        const selectedCourse = await selectedCategory.courses;

        const categoriesExceptSelected = await Course.find(
                                                {_id: {$ne: categoryId}
                                            }).populate("courses");

        let differentCourses = []

        for(const category of categoriesExceptSelected){
            differentCourses.push(...category.courses);
        }
        const allCategories = await Category.find({}).populate("courses");
        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0,10);

        return res.status(200).json({
            selectedCourse: selectedCourse,
            differentCourses: differentCourses,
            mostSellingCourses: mostSellingCourses
        });
    } catch (error) {
        return sendResponse(res, 500, false, "Internal server error");
    }
}
export {
    createCategory,
    showAllCategory,
    categoryPageDetails
}