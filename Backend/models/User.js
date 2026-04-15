const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
    },
    name: String,
    email: String,
    profilePhotoUrl: {
      type :String,
      default : ""
    },
    profilePhotoSource: {
      type :String,
      default : "google"
    },
    // can store in s3 in future if we want to support custom profile photos uploaded by users instead of using Google profile photos
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);