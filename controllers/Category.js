import Category from '../models/Category.js';
import sendResponse from '../utlis/sendResponse.js';

// Done: Updated
function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

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
    // TODO : To be updated
    try {
        const { categoryId } = req.body;
        // console.log("Category", categoryId);
        const selectedCategory = await Category.findById(categoryId)
                                                .populate({
                                                    path: "course",
                                                    match: { status: "Published"},
                                                    populate: "ratingAndReviews"
                                                })
                                                .exec();
        // console.log(selectedCategory);
        
        if(!selectedCategory){
            console.log("category not found");
            return sendResponse(res, 404, false, "Category not found");
        }
        if(selectedCategory.course.length === 0){
            return sendResponse(res, 404, false, "No course found for this category");
        }
        const selectedCourse = selectedCategory.course;
        // console.log("selectedC Course",selectedCourse);

        const categoriesExceptSelected = await Category.find({_id: {$ne: categoryId} });

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
        )
        .populate({
            path: "course",
            match: {status: "Published"}
        })
        .exec();

        const allCategories = await Category.find()
                                        .populate({
                                            path: "course",
                                            match: {status: "Published"},
                                            populate: {
                                                path: "instructor"
                                            }
                                        })
                                        .exec();
        
        const allCourses = allCategories.flatMap((category) => category.course);
        const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0,10);
        // console.log("cat exp sel ",categoriesExceptSelected);

        // let differentCourses = []

        // for(const category of categoriesExceptSelected){
        //     if (category.category.course) {
        //         differentCourses.push(...category.category.course);
        //     }        
        // }
        // // console.log("diff Course",differentCourses);
        // const allCategories = await Category.find({}).populate("course");
        // const allCourses = allCategories.flatMap((category) => category.course);
        // const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0,10);

        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses
            }
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