import mongoose from "mongoose";

const fitnessSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD format
        required: true
    },
    meals: {
        type: String,
    },
    workout: {
        type: String,
    },
    caloriesEstimate: {
        type: String,
    },
    caloriesBurned:{
        type:String,
    },
    proteinEstimate: {
        type: String,
    },
    summary: {
        type: String,
    }
}, { timestamps: true })

// Ensure only one entry per user per date
fitnessSchema.index({ userId: 1, date: 1 }, { unique: true });

const fitnessModel = mongoose.model('fitness', fitnessSchema)

export default fitnessModel;
