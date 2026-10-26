const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    { 
    author:{
        type:String,
        required:true,
        trim:true
    },

    room:{
        type:String,
        required:true,
        trim:true
    },
    text:{
        type:String,
        required:true,
        trim:true,
        maxlength:2000
    },
    type:{
        type:String,
        enum:['text','sticker','meme'],
        default:'text'
    },
    assetId:{
        type:String,
        default:null
    },
},{timestamps:true} );

const Message = mongoose.model('Message',messageSchema);

module.exports = Message;
