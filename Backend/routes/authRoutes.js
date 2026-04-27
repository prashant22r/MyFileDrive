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
const frontendUrl = process.env.CLIENT_URL;

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${frontendUrl}/signin`,
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

      const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      return res.status(500).json({ error: "Failed to generate token" });
    }
  }
);

module.exports = router;