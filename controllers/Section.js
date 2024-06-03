const Course = require("../models/Course");
const Section = require("../models/Section");

// create section
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    const userId = req.user.id;

    // validate
    if (!sectionName || !courseId) {
      return res.status(404).json({
        success: false,
        message: "Please provide section name and course ID",
      });
    }
    // create a course
    const sectionDetails = await Section.create({
      sectionName: sectionName,
    });

    // update in course schema
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          courseContent: sectionDetails._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: updatedCourseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// update section
exports.updateSection = async (req, res) => {
  try {
    // fetch data
    const { sectionName, sectionId } = req.body;

    if (!sectionName || !sectionId) {
      return res.status(404).json({
        success: false,
        message: "Please fill the section name",
      });
    }

    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        sectionName: sectionName,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: sectionDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// delete section
exports.deleteSection = async (req, res) => {
  try {
    // fetch id
    const { sectionId } = req.params;
    const { courseId } = req.body;

    const sectionDetails = await Section.findById(sectionId);

    if (!sectionDetails) {
      return res.status(404).json({
        success: false,
        message: "Section doesn't exist",
      });
    }

    const courseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $pull: {
          courseContent: sectionId,
        },
      },
      { new: true }
    );

    await Section.findByIdAndDelete(sectionId);

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
