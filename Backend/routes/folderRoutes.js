const express = require("express");
const Folder = require("../models/Folder");
const File = require("../models/File");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const mongoose = require("mongoose");

// Collect all descendant folder ids (recursive) for cycle prevention when moving folders.
const collectDescendants = async (ownerId, rootFolderId) => {
  const descendants = new Set();
  const queue = [rootFolderId];

  while (queue.length) {
    const currentId = queue.shift();

    // Find direct children of currentId
    const children = await Folder.find({
      owner: ownerId,
      parentFolder: currentId,
    }).select("_id");

    for (const child of children) {
      const id = String(child._id);
      if (!descendants.has(id)) {
        descendants.add(id);
        queue.push(child._id);
      }
    }
  }

  return descendants;
};


// Create a new folder
router.post("/folders", protect, async(req, res)=>{
    try {
        const {name, parentFolderId} = req.body;

        if(!name || name.trim() === ""){
            return res.status(400).json({message : "Folder name is required"});
        }

        const folder = await Folder.create({
            owner : req.user.userId,
            name : name.trim(),
            parentFolder : parentFolderId && mongoose.Types.ObjectId.isValid(parentFolderId) ? parentFolderId : null
        });

        return res.status(201).json({
            message : "Folder created successfully",
            folder : {
                owner : folder.owner,
                name : folder.name,
                parentFolder : folder.parentFolder,
                id : folder._id,
            }
        });

    }
    catch (error) {
        return res.status(500).json({message : "Failed to create folder", error : error.message});
    }
    
});

// get folder inside parent folder
router.get("/folders", protect, async(req, res)=>{
    try{
        const parentFolderIdRaw = req.query.parentFolderId;
        const parentFolderId =
            parentFolderIdRaw === undefined || parentFolderIdRaw === "null"
                ? null
                : parentFolderIdRaw;

        if (parentFolderId && !mongoose.Types.ObjectId.isValid(parentFolderId)) {
            return res.status(400).json({ message: "Invalid parentFolderId" });
        }

        const folders = await Folder.find({
            owner : req.user.userId,
            parentFolder : parentFolderId
        }).sort({createdAt : -1});

        return res.status(200).json({
            folders : folders.map(folder => ({
                id : folder._id,
                name : folder.name,
                createdAt : folder.createdAt,
                parentFolder : folder.parentFolder
            }))
        });
    }
    catch (error) {
        return res.status(500).json({message : "Failed to retrieve folders", error : error.message});
    }
});

// Rename a folder
router.patch("/folders/:id", protect, async (req, res) => {
  try {
    const folderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ message: "Invalid folder ID" });
    }

    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    if (String(folder.owner) !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    folder.name = String(name).trim();
    await folder.save();

    return res.status(200).json({
      message: "Folder renamed successfully",
      folder: {
        id: folder._id,
        name: folder.name,
        parentFolder: folder.parentFolder,
        createdAt: folder.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Move a folder to a new parent (root if parentFolderId = null)
router.patch("/folders/:id/move", protect, async (req, res) => {
  try {
    const folderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ message: "Invalid folder ID" });
    }

    const parentFolderIdRaw = req.body.parentFolderId;
    if (parentFolderIdRaw === undefined) {
      return res.status(400).json({ message: "parentFolderId is required" });
    }

    let parentFolderId = null;
    if (parentFolderIdRaw === null || parentFolderIdRaw === "null" || parentFolderIdRaw === "") {
      parentFolderId = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(parentFolderIdRaw)) {
        return res.status(400).json({ message: "Invalid parentFolderId" });
      }
      parentFolderId = parentFolderIdRaw;
    }

    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    if (String(folder.owner) !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Validate target parent (if not root)
    if (parentFolderId) {
      const targetParent = await Folder.findOne({
        _id: parentFolderId,
        owner: req.user.userId,
      });
      if (!targetParent) {
        return res.status(404).json({ message: "Target parent folder not found" });
      }
    }

    // Prevent moving folder into its own descendant
    if (parentFolderId && String(parentFolderId) === String(folder._id)) {
      return res.status(400).json({ message: "Invalid move: cannot move folder into itself" });
    }

    const descendants = await collectDescendants(req.user.userId, folder._id);
    if (parentFolderId && descendants.has(String(parentFolderId))) {
      return res.status(400).json({ message: "Invalid move: cannot move into a descendant folder" });
    }

    folder.parentFolder = parentFolderId;
    await folder.save();

    return res.status(200).json({
      message: "Folder moved successfully",
      folder: {
        id: folder._id,
        name: folder.name,
        parentFolder: folder.parentFolder,
        createdAt: folder.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete a folder only if it's empty (no subfolders and no files)
router.delete("/folders/:id", protect, async (req, res) => {
  try {
    const folderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ message: "Invalid folder ID" });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    if (String(folder.owner) !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [fileCount, childFolderCount] = await Promise.all([
      File.countDocuments({ owner: req.user.userId, folderId }),
      Folder.countDocuments({ owner: req.user.userId, parentFolder: folderId }),
    ]);

    if (fileCount > 0 || childFolderCount > 0) {
      return res.status(409).json({
        message:
          "Folder is not empty. Move/delete files and subfolders first (option 1: block delete).",
        folderId,
        fileCount,
        childFolderCount,
      });
    }

    await folder.deleteOne();

    return res.status(200).json({
      message: "Folder deleted successfully",
      folderId: folder._id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;