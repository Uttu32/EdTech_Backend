const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// send otp
exports.sendOTP = async (req, res) => {
  try {
    const email = req.email;

    // check if email already exist in User db
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    // generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP is here", otp);
    // check unique otp or not
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = {
      email: email,
      otp: otp,
    };

    let otpBody = await OTP.create(otpPayload);
    console.log(otpBody);
    return res.status(200).json({
      success: true,
      message: "Otp created successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// signup hanlder
exports.signUp = async (req, res) => {
  try {
    // data fetch from req body
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
    // validation of data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2 password match kro
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword doesn't match, please try again",
      });
    }

    // check if user already exist
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // find most recent OTP for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAT: -1 })
      .limit(1);

    console.log(recentOtp);

    // validate otp
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid OTP",
      });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create entry in db

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      accountType,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // return res
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// login handler
exports.login = async (req, res) => {
  try {
    // fetch dataa
    const { email, password } = req.body;
    // validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Please fill all the input fields",
      });
    }
    // check user exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    // check password
    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // generate token (JWT)
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    user.token = token;
    user.password = undefined;

    // create cookie and send response
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res.cookie("token", token, options).status(200).json({
      success: true,
      message: "Logged in Successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// change password
exports.changePassword = async (req, res) => {
  try {
    // fetch data => get oldPassword, newPassword, confirmPassword
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const currentUserId = req.user.id;
    const user = await User.findById(currentUserId);
    // validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "All fields are required, please try again",
      });
    }
    // compare old password with the password stored in db
    if (!(await bcrypt.compare(user.password, oldPassword))) {
      return res.status(400).json({
        success: false,
        message: "Please enter correct password",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "newPassword and confirmPassword doesn't match",
      });
    }

    // now hash the newPassword before storing in db
    let hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password in db
    user.password = hashedPassword;
    await user.save();

    // send mail- password updated
    const mailResponse = await mailSender(
      user.email,
      "Password Update status",
      "Password Updated Successfully"
    );
    console.log("Here is mail Response", mailResponse);
    // return res
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
