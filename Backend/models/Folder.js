const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    owner :{
        ref : 'User',
        type : mongoose.Schema.Types.ObjectId,
        required:true,
        index: true
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    parentFolder:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Folder',
        default : null
    },
},
    {timestamps:true}
);

folderSchema.index({owner : 1, parentFolder : 1, name : 1}, {unique:true});
// index based on owner, parentFolder and name for fast retrieval and to enforce unique folder names within the same parent folder for a user

module.exports = mongoose.model('Folder', folderSchema);