const express = require("express");
const crypto = require("crypto");
const { getUpload } = require("../config/multer");
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");
const { protect } = require("../middleware/authMiddleware");
const File = require("../models/File");
const mongoose = require("mongoose");

const router = express.Router();

// Upload route
router.post("/upload", protect, (req, res) => {
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

      const contentHash = crypto
        .createHash("sha256")
        .update(file.buffer)
        .digest("hex");

      const existingFile = await File.findOne({
        owner: req.user.userId,
        contentHash,
      });

      if (existingFile) {
        return res.status(200).json({
          message: "Duplicate file already exists",
          duplicate: true,
          file: {
            id: existingFile._id,
            owner: existingFile.owner,
            originalName: existingFile.originalName,
            mimeType: existingFile.mimeType,
            size: existingFile.size,
            bucket: existingFile.bucket,
            s3Key: existingFile.s3Key,
            contentHash: existingFile.contentHash,
            createdAt: existingFile.createdAt,
          },
        });
      }

      const s3Key = `${req.user.userId}/${Date.now()}_${file.originalname}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,          
        ContentType: file.mimetype,
      };

      const s3Result = await s3.send(new PutObjectCommand(params));

      const savedFile = await File.create({
        owner: req.user.userId,
        s3Key,
        bucket: process.env.AWS_BUCKET_NAME,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        contentHash,
        isPublic: false,
      });

      return res.status(201).json({
        message: "File uploaded to S3",
        duplicate: false,
        file: {
          id: savedFile._id,
          owner: savedFile.owner,
          originalName: savedFile.originalName,
          mimeType: savedFile.mimeType,
          size: savedFile.size,
          bucket: savedFile.bucket,
          s3Key: savedFile.s3Key,
          contentHash: savedFile.contentHash,
          createdAt: savedFile.createdAt,
        },
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// List current user's uploaded files
router.get("/files", protect, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      File.find({ owner: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id owner originalName mimeType size bucket s3Key contentHash createdAt"),
      File.countDocuments({ owner: req.user.userId }),
    ]);

    return res.status(200).json({
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + files.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/files/:id", protect, async(req, res)=>{
  try{
    const fileId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(fileId)){
      // Invalid file ID format
      return res.status(400).json({ message: "Invalid file ID" });
    }

    // fetch file from DB
    const file = await File.findById(fileId);
    if(!file){
      return res.status(404).json({ message: "File not found" });
    }

    // check ownership
    if(file.owner.toString() !== req.user.userId){
      return res.status(403).json({ message: "Forbidden - you do not have permission to delete this file" });
    }

    // delete from s3
    const bucket = file.bucket;
    const key = file.s3Key;

    await s3.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    }));

    // delete from DB
    await File.findByIdAndDelete(fileId);

    return res.status(200).json({ message: "File deleted successfully" , file :{
      id: file._id,
      owner: file.owner,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      bucket: file.bucket,
      s3Key: file.s3Key,
      contentHash: file.contentHash,
      createdAt: file.createdAt,
    }});
  }
  catch(error){
    // console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/files/:id/url", protect, async(req, res)=>{
  try{
    const fileId = req.params.id;

    if(!mongoose.Types.ObjectId.isValid(fileId)){
      return res.status(400).json({ message: "Invalid file ID" });
    }

    // fetch file from DB
    const file = await File.findById(fileId);
    if(!file){
      return res.status(404).json({ message: "File not found" });
    }

    // check ownership
    if(file.owner.toString() !== req.user.userId){
      return res.status(403).json({ message: "Forbidden - you do not have permission to access this file" });
    }

    const bucket = file.bucket;
    const key = file.s3Key;
    const isDownload = req.query.download === "true";

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentType: file.mimeType,
      ResponseContentDisposition: isDownload
        ? `attachment; filename="${file.originalName}"`
        : `inline; filename="${file.originalName}"`,
    });
    const url = await getSignedUrl(
      s3,
      command,
      { expiresIn: 60 * 60 } // URL valid for 1 hour
    )

    return res.status(200).json({
      message: "Pre-signed URL generated successfully",
      url,
      mode: isDownload ? "download" : "inline",
      file: {
        id: file._id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
      },
    });
  }
  catch(error){
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// 69dfa2e1b4436d45e838b5e1