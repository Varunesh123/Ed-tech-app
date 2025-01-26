import sendResponse from "../utlis/sendResponse.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

const updateProfile = async(req, res) => {
    try {
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        const id = req.user.id;

        if(!id || !contactNumber || !gender){
            return sendResponse(res, 400, false, "All fields are required");
        }
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();

        return sendResponse(res, 200, true, "Profile updated successfully", profileDetails);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to update Profile");
    }
}
const deleteProfile = async(req, res) => {
    try {
        const {userId} = req.user.id;
        const userDetails = await User.findById(userId);
        if(!userDetails){
            return sendResponse(res, 400, false, "User not found");
        }
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});

        await User.findByIdAndDelete({_id: userId});

        return sendResponse(res, 200, true, "User deleted successfully")
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to delete profile")
    }
}
const getAllUserDetails = async(req, res) => {
    try {
        const userId = req.user.id;
        const userDetails = await User.findById(userId).populate("additionalDetails").exec();

        return sendResponse(res, 200, true, "All details of user fetched successfully", userDetails);
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, false, "Unable to fetched all user");
    }
}
export {
    updateProfile,
    deleteProfile,
    getAllUserDetails
}