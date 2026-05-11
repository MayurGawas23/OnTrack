import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    habit_title: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        enum: ["Daily", "Weekly", "Monthly", "Custom Date"],
        default: "Daily"
    },
    customDate: {
        type: String // YYYY-MM-DD
    },
    target_value: {
        type: String
    },

    // only for habits linked to goals

    goalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "goal",
        default: null,
    },
    points: {
        type: Number,
        default: 10
    }
}, { timestamps: true })

const HabitModel = mongoose.model('habit', habitSchema)

export default HabitModel