const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role || "user",
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );

      return res.status(200).json({
        message: "Authentication successful",
        token,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          profilePhotoUrl: req.user.profilePhotoUrl,
          profilePhotoSource: req.user.profilePhotoSource || "google",
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to generate token" });
    }
  }
);

module.exports = router;