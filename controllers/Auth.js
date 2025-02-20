import OTP from '../models/OTP.js';
import User from '../models/User.js';
import otpGenerator from 'otp-generator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Profile from '../models/Profile.js';
import sendResponse from '../utlis/sendResponse.js';
import dotenv from 'dotenv';

dotenv.config();

const sendOTP = async (req, res) => {
    // console.log("Sending OTP");
    try {
        const { email } = req.body;
        // console.log("email: ", email);
        const checkEmail = await User.findOne({ email });
        if (checkEmail) {
            return sendResponse(res, 401, false, "User already exists");
        }

        let otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        let result = await OTP.findOne({ otp });
        // console.log("result", result);
        while (result) {
            otp = otpGenerator.generate(6, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp });
        }
        const otpPayload = { email, otp };

        // console.log("payload", otpPayload);  

        const savedOTP = await OTP.create(otpPayload);
        // console.log("Saved OTP in DB:", savedOTP);


        return sendResponse(res, 200, true, "OTP sent successfully", otp);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 400, false, "Unable to send OTP", error.message);
    }
};

// Sign Up
const signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return sendResponse(res, 403, false, "All fields are required");
        }

        if (password !== confirmPassword) {
            return sendResponse(res, 400, false, "Passwords do not match");
        }

        const user = await User.findOne({ email });
        if (user) {
            return sendResponse(res, 400, false, "User already exists");
        }
        console.log("user", user);
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log('recentOtp', recentOtp);
        if (recentOtp.length === 0 || otp !== recentOtp[0].otp) {
            return sendResponse(res, 400, false, "Invalid OTP");
        }
        // console.log('recentOtp', recentOtp);
        const hashedPassword = await bcrypt.hash(password, 10);

        // let approved = "";
        // accountType === "Instructor" ? (approved = false) : (approved = true); 

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });
        console.log('prf', profileDetails);
        const userData = {
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            // approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        };
        // if (req.body.googleId) {
        //     userData.googleId = req.body.googleId;
        // }
        console.log('userdata', userData);
        const newUser = await User.create(userData);
        return sendResponse(res, 200, true, "User registered successfully", newUser);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 400, false, "Unable to register user");
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendResponse(res, 403, false, "Email and password are required");
        }

        const user = await User.findOne({ email }).populate('additionalDetails');
        if (!user) {
            return sendResponse(res, 401, false, "User not found");
        }
        console.log("Bcrypt password")
        if (await bcrypt.compare(password, user.password)) {
            const payload = { email: user.email, id: user._id, accountType: user.accountType };
            // console.log("payload", payload);
            // console.log("JWT_SECRET", process.env.JWT_SECRET);

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
            // console.log("token", token);

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            return res
                    .cookie("token", token, options)
                    .status(200)
                    .json({
                        success: true,
                        message: "Logged in successfully",
                        token, 
                        user 
                    });
        } else {
            return sendResponse(res, 401, false, "Incorrect password");
        }
    } catch (error) {
        console.error(error);
        return sendResponse(res, 400, false, "Login failed, please try again", error.message);
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { email, currPassword, newPassword, confirmPassword } = req.body;

        if (!email || !currPassword || !newPassword || !confirmPassword) {
            return sendResponse(res, 403, false, "All fields are required");
        }
        if (newPassword !== confirmPassword) {
            return sendResponse(res, 400, false, "New passwords do not match");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return sendResponse(res, 400, false, "User not found");
        }

        if (await bcrypt.compare(currPassword, user.password)) {
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save()
            return sendResponse(res, 200, true, "Password changed successfully", user.password);
        } else {
            return sendResponse(res, 400, false, "Incorrect current password");
        }
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Unable to change password");
    }
};

export { sendOTP, signUp, login, changePassword };
