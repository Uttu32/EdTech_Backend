const User = require("../models/User");
const Profile = require("../models/Profile");

exports.updateProfile = async (req, res) => {
  try {
    // fetch data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    // get userId
    const userId = req.user.id;
    // validation
    if (!gender || !contactNumber || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const userDetails = await User.findById(userId);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    // if (dateOfBirth.trim() !== "") {
    //   profileDetails.dateOfBirth = dateOfBirth;
    // }
    // if (about.trim() !== "") {
    //   profileDetails.about = about;
    // }
    // if (contactNumber !== "") {
    //   profileDetails.contactNumber = contactNumber;
    // }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profileDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// delete account
// To study :- How can we schedule this deletion operation using (CRON Job)
exports.deleteAccount = async (req, res) => {
  try {
    // fetch data  get id
    const userId = req.user.id;
    // validation
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // delete profile presnt in the user
    const profileId = userDetails.additionalDetails;
    await Profile.findByIdAndDelete({_id: profileId});
    // delete
    await User.findByIdAndDelete({_id: userId});

    // ------------>>>>>>  TODO: --->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //          x
    // --------->>>>>>  TODO: ------->>>>>>>>>>>>>>>>>>>>>>>>>>>>



    // return res
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get all user details handler function
exports.getAllUserDetails = async (req, res) => {
  try {
        
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}