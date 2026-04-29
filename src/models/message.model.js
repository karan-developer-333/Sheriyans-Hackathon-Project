import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    incident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Incident",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


messageSchema.index({ incident: 1, createdAt: -1,sender: 1 });
const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;