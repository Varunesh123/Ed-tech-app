import mailSender from '../utlis/mailSender.js';
import contactUsEmail from '../mail/template/contactUsEmail.js';
import sendResponse from '../utlis/sendResponse.js';

const contactUsController = async(req, res) => {
    const {email, firstName, lastName, message, phoneNo, coutrycode} = req.body
    console.log(req.body);
    try {
        const emailRes = await mailSender(
                                email,
                                "Your data send successfully",
                                contactUsEmail(email, firstName, lastName, message, phoneNo, coutrycode)
                            );
        console.log("Email Res: ", emailRes);
        return sendResponse(res, 200, true, "Email Send successfully");
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, error.message);
    }    
}
export default contactUsController