const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    owner: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    s3Key: {
        required: true,
        type: String,
        unique: true
    },
    bucket:{
        required: true,
        type: String
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    contentHash: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    folderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Folder',
        default : null
    }
}, { timestamps: true });

fileSchema.index({ owner: 1, contentHash: 1 }, { unique: true }); // Prevent duplicate uploads for the same user
fileSchema.index({ owner : 1, folderId : 1, createdAt : -1 }); // For efficient retrieval of files within a folder sorted by creation date

module.exports = mongoose.model('File', fileSchema);


