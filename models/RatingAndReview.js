const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectIdl;

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: objId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
