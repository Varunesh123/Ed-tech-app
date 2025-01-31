import mongoose from 'mongoose';
import Course from '../models/Course.js';
import RatingAndReview from '../models/RatingAndReview.js';
import sendResponse from '../utlis/sendResponse.js';

const createRating = async(req, res) => {
    try {
        const {rating, review, courseId} = req.body;
        const userId = req.user.id;

        const courseDetails = await Course.findOne(
                                {
                                    _id: courseId,
                                    studentsEnrolled: {$elemMatch: {$eq: userId}}
                                }
                            );
        if(!courseDetails){
            return sendResponse(res, 404, false, "User not enrolled in Course");
        }
        const alreadyReviewed = await RatingAndReview.findOne(
                                    {
                                        user: userId,
                                        course: courseId
                                    }
                                );
        if(alreadyReviewed){
            return sendResponse(res, 403, false, "User has already given rating");
        }
        const ratingReview = await RatingAndReview({
                                    rating,
                                    review,
                                    course: courseId,
                                    user: userId
                                });
        const updateCourseDetails = await Course.findByIdAndUpdate(
            {_id: userId},
            {
                $push: {
                    ratingAndReview: ratingReview._id
                }
            },
            {new: true}
        )
        console.log(updateCourseDetails);
        
        return sendResponse(res, 200, true, "Rating and review created successfully", ratingReview);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, error.message)
    }
}
const getAverageRating = async(req, res) => {
    try {
        const courseId = req.body.courseId;

        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ]);
        if(result.length > 0){
            return sendResponse(res, 200, true, result[0].averageRating)
        }
        return sendResponse(res, 200, true, "No ratings till now");
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, error.message);
    }
}
const getAllRating = async(req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path: "user",
                                        select: "firstName lastName email image"
                                    })
                                    .populate({
                                        path: "course",
                                        select: "courseName"
                                    })
                                    .exec();
        return sendResponse(res, 200, true, "All reviews fetched successfully", allReviews);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, error.message)
    }
}
export {
    createRating,
    getAverageRating,
    getAllRating
}