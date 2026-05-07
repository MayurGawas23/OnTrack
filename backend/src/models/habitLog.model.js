import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    habit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'habit'
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'missed']
    },
    value: Number,
    note: String


}, { timestamps: true })

const HabitLogModel = mongoose.model('habitlog', habitLogSchema)

export default HabitLogModel