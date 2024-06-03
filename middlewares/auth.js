const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(403).json({
        success: false,
        message: "Token not found",
      });
    }
    const token =
      req.headers.authorization.split(" ")[1] ||
      req.cookies.token ||
      req.body.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// isStudent
exports.isStudent = async (req, res, next) => {
  try {
    const { accountType } = req.user;
    if (accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for students only",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    const { accountType } = req.user;
    if (accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for instructor only",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    const { accountType } = req.user;
    if (accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};