import sendResponse from "../utlis/sendResponse";
import User from '../models/User.js';
import mailSender from "../utlis/mailSender";
import bcrypt from 'bcrypt'

const resetPassordToken = async(req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({email});
        if(!user){
            return sendResponse(res, 401, false, "User not exist");
        }
        const token = crypto.randomUUID();
        const updatedDetails = await User.findOneAndUpdate(
            {email: email},
            {
                token: token,
                resetPassworsExpires: 5*60*1000
            },
            {new: true}
        );
        const url = `http://localhost:3000/update-password/${token}`;

        await mailSender(email, "Paasword reset link", `Password Reset Link: ${url}`);

        return sendResponse(res, 200, true, 'Email sent successfully, please check email and change pwd');
    } catch (error) {
        return sendResponse(res, 500, false, 'Something went wrong while sending reset pwd mail');
    }
}
const resetPassord = async(req, res) => {
    try {
        const {password, confirmPassword, token} = req.body;
        
        if(password !== confirmPassword){
            return sendResponse(res, 401, false, "Password does not match");
        }
        const user = await User.findOne({token: token});

        if(!user){
            return sendResponse(res, 401, false, "Invalid token");
        }
        if(user.resetPassworsExpires < Date.now()){
            return sendResponse(res, 401, false, "Token is expired, please regenerate your token");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new : true}
        )
        return sendResponse(res, 200, true, "Password reset successfully");
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "'Something went wrong while sending reset pwd mail'");
    }
}

export {
    resetPassord,
    resetPassordToken
}