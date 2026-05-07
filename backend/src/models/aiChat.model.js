import mongoose from "mongoose";

const aiChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique: true
    },
    messages: [
        {
            role: {
                type: String, // 'user' or 'ai'
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const AiChatModel = mongoose.model("aichat", aiChatSchema);

export default AiChatModel;
