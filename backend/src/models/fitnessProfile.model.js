import mongoose from "mongoose";

const fitnessProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    weight: { type: Number },
    height: { type: Number },
    fitnessGoal: { type: String }, // gain, loss, build
    activityLevel: { type: String }, // Sedentary, Light, Moderate, Active
    sleepHours: { type: Number },
    dietPreferences: { type: String }, // Veg, Non-Veg, Vegan, etc.
    dietPlan: { type: String }, // AI generated JSON string or text
    targetCalories: { type: Number },
    targetProtein: { type: Number },
    targetBurn: { type: Number }
}, { timestamps: true });

const fitnessProfileModel = mongoose.model('fitnessProfile', fitnessProfileSchema);

export default fitnessProfileModel;
