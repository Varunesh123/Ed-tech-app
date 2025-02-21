import express from "express";
import { auth, isAdmin, isInstructor, isStudent} from '../middlewares/auth.js';
import {
    createCourse, 
    showAllCourses,
    editCourse,
    getCourseDetails,
    getFullCourseDetails,
    getInstructorCourses,
    deleteCourse
} from "../controllers/Course.js";

import {
    createCategory,
    showAllCategory,
    categoryPageDetails
} from '../controllers/Category.js';

import {
    createSection,
    updateSection,
    deleteSection
} from '../controllers/Section.js';

import {
    createSubsection,
    updateSubsection,
    deleteSubsection
} from '../controllers/Subsection.js';

import {
    createRating,
    getAverageRating,
    getAllRating
} from '../controllers/RatingAndReview.js';

const router = express.Router();

router.post('/createCourse', auth, isInstructor, createCourse); //Done
router.get('/getAllCourses', showAllCourses); 
router.post('/getCourseDetails', auth, getCourseDetails); //Done
router.post('/getFullCoureDetails', auth, getFullCourseDetails); 
router.post('/editCourse', auth, isInstructor, editCourse);
router.get('/getInstructorCourses', auth, isInstructor, getInstructorCourses);
router.delete('/deleteCourse', deleteCourse);

router.post('/addSection', auth, isInstructor, createSection); 
router.post('/updateSection', auth, isInstructor, updateSection);
router.post('/deleteSection', auth, isInstructor, deleteSection);

router.post('/updateSubSection', auth, isInstructor, updateSubsection);
router.post('/deleteSubSection', auth, isInstructor, deleteSubsection);
router.post('/addSubSection', auth, isInstructor, createSubsection);

router.post('/createCategory', auth, isAdmin, createCategory); //Done
router.get('/showAllCategories', showAllCategory);
router.post('/getCategoryPageDetails', categoryPageDetails);

router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating',getAverageRating);
router.post('/getReviews', getAllRating);

export default router;

