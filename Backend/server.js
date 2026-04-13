require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const connectDB = require("./config/db");
const { initStorage } = require("./config/multer");

// Initialize app
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport config
require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");

app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", fileRoutes);


app.get("/", (req, res) => {
  res.send("MyFileDrive API Running");
});

//Start server AFTER DB is ready
const startServer = async () => {
  try {
    // 1. Connect DB
    await connectDB();
    console.log("MongoDB Connected");

    // 2. Initialize Multer storage for uploads
    initStorage();

    // 3. Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Server failed to start:", err);
  }
};

startServer();