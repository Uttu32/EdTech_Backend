const Category = require("../models/Category");

// createTag handle function for Tag
exports.createCategory = async (req, res) => {
  try {
    //  fetch data
    const { name, description } = req.body;
    // validation
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "All fields are required, please try again",
      });
    }
    // create category
    const categoryDetails = await Tag.create({
      name: name,
      description: description,
    });
    console.log("category details --->>", categoryDetails);
    // return res
    return res.status(200).json({
      success: true,
      message: "Tag created successfully ",
      data: categoryDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

// getAllTag handler function
exports.showAllCategories = async (req, res) => {
  try {
    const allCategory = await Tag.find({}, { name: true, description: true });
    res.status(200).json({
      success: true,
      message: "All tags returned successfully",
      data: allCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};
