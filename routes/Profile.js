import express from 'express';
import {
    updateProfile,
    deleteProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard
} from '../controllers/Profile.js';

import {auth, isInstructor} from '../middlewares/auth.js';

const router = express.Router();

router.post('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateDisplayPicture', auth, updateDisplayPicture)
router.get('/instructorDashboard', auth, isInstructor, instructorDashboard); 

router.delete('/deleteProfile', auth, deleteProfile); 
router.put('/updateProfile', auth, updateProfile);
router.get('/getUserDetails', auth, getAllUserDetails);

export default router;