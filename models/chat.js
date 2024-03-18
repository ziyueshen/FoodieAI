const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    userId: {
        type: String,
        required: true,
        //ref: 'User'
    },
    query: {
        type: String,
        required: true
    },
    messages: [{
        sender: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        }
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Chat", chatSchema);