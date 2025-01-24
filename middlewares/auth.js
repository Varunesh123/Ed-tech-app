import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sendResponse from '../utlis/sendResponse.js';

dotenv.config();

const auth = async(req, res, next) => {
    try {
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer", "");
        if(!token){
            return sendResponse(res, 401, false, "Token is missing");       
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            console.log(payload);
            req.user = token;
        } catch (error) {
            return sendResponse(res, 400, false, "Invalid token");
        }
        next();
    } catch (error) {
        return sendResponse(res, 401, false, "Something wrong in verifying token")
    }
}
const isStudent = async(req, res, next) => {
    try{
        if(req.user.accountType !== 'Student') {
            return sendResponse(res, 401, false, 'Only Student can access');
        }
        next();
    } catch(error) {
        return sendResponse(res, 500, false, 'Cannot be verified, try again');
    }
}
const isInstructor = async(req, res, next) => {
    try {
        if(req.user.accountType !== 'Instructor'){
            return sendResponse(res, 401, false, "Only Instructor can access")
        }
        next();
    } catch (error) {
        return sendResponse(res, 500, false, 'Cannot be verified, try again');
    }
}
const isAdmin = async(req, res, next) => {
    try {
        if(req.user.accountType !== 'Admin'){
            return sendResponse(res, 401, false, "Only Admin can access")
        }
        next();
    } catch (error) {
        return sendResponse(res, 500, false, 'Cannot be verified, try again');
    }
}
export {
    auth,
    isStudent,
    isInstructor,
    isAdmin
}