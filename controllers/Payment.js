import sendResponse from '../utlis/sendResponse.js';
import Course from '../models/Course.js';
import mongoose from 'mongoose';
import instance from '../config/razorpay.js';
import mailSender from '../utlis/mailSender.js';
import User from '../models/Course.js';

const capturePayment = async(req, res) => {
    const { course_id } = req.body;
    const userId = req.user.id;

    if(!course_id){
        return res.json({
            success: false,
            message: "Invalid course id"
        })
    }
    let course;
    try {
        course = await Course.findById(course_id);
        if(!course){
            return sendResponse(res, 404, false, "Course does not exist");
        }
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentEnrolled.includes(uid)){
            return sendResponse(res, 200, true, "Student is already Enrolled");
        }
    } catch (error) {
        return res.sendResponse(res, 500, false, error.message);
    }
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId
        }
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        
        return res.status(200).json({
            success:  true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount
        });
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Could not initiate order");
    }
};
const verifySignature = async(req, res) => {
    const webhookSecrete = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecrete);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is Authorised");
        
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id: courseId},
                                            {
                                                $push: {studentEnrolled: userId}
                                            },
                                            {new: true}
                                        );
            if(!enrolledCourse){
                return sendResponse(res, 500, false, "Course not found");
            }
            console.log(enrolledCourse);

            const enrolledStudent = await User.findOneAndUpdate(
                                            {_id: userId},
                                            {$push: {courses: courseId}},
                                            {new: true}
                                        );
            console.log(enrolledStudent);
            
            const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                    "Congratulations from CodeHelp",
                                    "Congratulations, you are onboarded into new CodeHelp Course",
                                );
            console.log(emailResponse);

            return sendResponse(res, 200, true, "Signature verified and course added");
            
        } catch (error) {
            console.log(error);
            return sendResponse(res, 500, false, error.message);
        }
    }
    else{
        return sendResponse(res, 400, false, "Invalid request");
    }
}
const sendPaymentSuccessEmail = async(req, res) => {
    // TODO
}

export {
    capturePayment,
    verifySignature,
    sendPaymentSuccessEmail
}