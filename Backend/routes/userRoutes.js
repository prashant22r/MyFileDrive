const express = require("express");

const router = express.Router();

// Get current user
router.get("/user", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
  req.logout(() => {
    res.redirect(clientUrl);
  });
});

module.exports = router;