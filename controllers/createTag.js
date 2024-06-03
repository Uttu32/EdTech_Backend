// createTag handle function for Tag
exports.createTag = async (req, res) => {
  try {
    //  fetch data
    // validation
    // check if present already
    // create tag
    // update in db;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};
