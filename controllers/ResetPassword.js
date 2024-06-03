const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    // get email
    const email = req.body.email;
    // check if email is registered or not , email validation
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Please provide your email",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered",
      });
    }
    // generate token for link
    const token = crypto.randomUUID();
    // update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    // create url
    const url = `http://localhost:3000/update-password/${token}`;
    // send mail containing url
    await mailSender(
      email,
      "Password reset link",
      `Password rest link is here :- ${url} . This link is only valid for 5 mins`
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Email sent successfully, please check and change your password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// restepassword
exports.resetPassword = async (req, res) => {
  try {
    // fetch url's token, and password and confirmPassowrd
    const { password, confirmPassword, token } = req.body;
    // validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword should be same",
      });
    }
    // get user details using token
    const userDetails = await User.findOne({ token: token });
    // validation :-  if user exist or not
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "Token is invalid",
      });
    }
    // token expire time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token is expired",
      });
    }

    // bcrypt and update password
    const hashedPassword = bcrypt.hash(password, 10);
    // password update in db
    const updatedDetails = await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    console.log("here is the updated details", updatedDetails);
    // return res
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
