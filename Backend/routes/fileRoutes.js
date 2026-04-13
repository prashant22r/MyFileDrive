const express = require("express");
const { getUpload } = require("../config/multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

const router = express.Router();

// Upload route
router.post("/upload", (req, res) => {
  const upload = getUpload().single("file");

  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileName = Date.now() + "-" + file.originalname;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,          
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(params));

      res.json({
        message: "File uploaded to S3",
        fileName: fileName,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
});

module.exports = router;