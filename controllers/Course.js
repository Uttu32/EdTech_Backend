const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
require("dotenv").config();
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// createCourse handle function
exports.createCourse = async (req, res) => {
  try {
    // fetch data from req.body
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;
    // get thumbnail
    const thumbnail = req.files.thumbnailImage;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor details ", instructorDetails);
    // TODO: Verify that userId and instructorDetails._id are same or different

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    // check given category is valid or not
    const categoryDetails = await Category.findById(tag);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category details not found",
      });
    }

    // upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // create an entry for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    // add new course to the user schema of instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // update tag schema
    await Category.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );

    //   return res
    return res.status(200).json({
      success: true,
      message: "Course Created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// getAllCourse handle function
exports.showAllCourses = async (req, res) => {
  try {
    // TODO : chnage the below statement incrementally
    const allCourses = await Course.find({});

    return res.status(200).json({
      success: true,
      message: "data for all coursesfetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
