import mongoose from "mongoose";

const dailyNoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: true
    },
    note: {
        type: String,
        default: ""
    },
    mood: {
        type: Number, // 1 to 5
        default: 3
    }
}, { timestamps: true })

// Ensure only one DailyNote per user per date
dailyNoteSchema.index({ user: 1, date: 1 }, { unique: true });

const DailyNoteModel = mongoose.model('dailynote', dailyNoteSchema)

export default DailyNoteModel
