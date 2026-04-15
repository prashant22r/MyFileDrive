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
    }
}, { timestamps: true });

fileSchema.index({ owner: 1, createdAt: -1 }); // For efficient retrieval of user's files sorted by creation date
fileSchema.index({ owner: 1, contentHash: 1 }, { unique: true }); // Prevent duplicate uploads for the same user

module.exports = mongoose.model('File', fileSchema);


