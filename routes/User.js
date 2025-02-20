import express from 'express';
import { login, signUp, sendOTP, changePassword} from '../controllers/Auth.js';
import { resetPasswordToken, resetPassword } from '../controllers/ResetPassword.js';
import {auth} from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signUp);
router.post('/sendotp', sendOTP);
router.post('/changepassword', auth, changePassword);

router.post('/reset-password-token', resetPasswordToken);
router.post('/reset-password', resetPassword);

export default router