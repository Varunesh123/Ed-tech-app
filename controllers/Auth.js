import OTP from '../models/OTP.js';
import User from '../models/User.js';
import otpGenerator from 'otp-generator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Profile from '../models/Profile.js';
import sendResponse from '../utlis/sendResponse.js';
import dotenv from 'dotenv';

dotenv.config();

// Send OTP
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

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
        while (result) {
            otp = otpGenerator.generate(6, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp });
        }

        const otpPayload = { email, otp };
        await OTP.create(otpPayload);
        return sendResponse(res, 200, true, "OTP sent successfully", otp);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 400, false, "Unable to send OTP");
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

        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (recentOtp.length === 0 || otp !== recentOtp[0].otp) {
            return sendResponse(res, 400, false, "Invalid OTP");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            contactNumber,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

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

        if (await bcrypt.compare(password, user.password)) {
            const payload = { email: user.email, id: user._id, accountType: user.accountType };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            return res.cookie("token", token, options)
                .sendResponse(200, true, "Logged in successfully", { token, user });
        } else {
            return sendResponse(res, 401, false, "Incorrect password");
        }
    } catch (error) {
        console.error(error);
        return sendResponse(res, 400, false, "Login failed, please try again");
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { email, currPassword, newPassword, confirmNewPassword } = req.body;

        if (!email || !currPassword || !newPassword || !confirmNewPassword) {
            return sendResponse(res, 403, false, "All fields are required");
        }
        // compare password
        if (newPassword !== confirmNewPassword) {
            return sendResponse(res, 400, false, "New passwords do not match");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return sendResponse(res, 400, false, "User not found");
        }

        if (await bcrypt.compare(currPassword, user.password)) {
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save()
            return sendResponse(res, 200, true, "Password changed successfully");
        } else {
            return sendResponse(res, 400, false, "Incorrect current password");
        }
    } catch (error) {
        console.error(error);
        return sendResponse(res, 400, false, "Unable to change password");
    }
};

export { sendOTP, signUp, login, changePassword };
