import express from 'express';
import {auth, isStudent} from '../middlewares/auth.js';
import {
    capturePayment,
    verifySignature,
    sendPaymentSuccessEmail
} from '../controllers/Payment.js';

const router = express.Router();

router.post('/capturePayment', auth, isStudent, capturePayment);
router.post('/verifySignature', auth, isStudent, verifySignature);
router.post('/sendPaymentSuccessEmail', auth, isStudent, sendPaymentSuccessEmail);

export default router;