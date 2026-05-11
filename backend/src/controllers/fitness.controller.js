import fitnessModel from '../models/fitness.model.js';
import fitnessProfileModel from '../models/fitnessProfile.model.js';
import userModel from '../models/user.model.js';

export const logFitness = async (req, res) => {
    try {
        const userId = req.userId;
        const { date, meals, workout, caloriesEstimate, caloriesBurned, proteinEstimate, summary } = req.body;

        const fitnessLog = await fitnessModel.findOneAndUpdate(
            { userId, date },
            { meals, workout, caloriesEstimate, caloriesBurned, proteinEstimate, summary },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: "Fitness logged successfully",
            fitnessLog
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getFitnessLogs = async (req, res) => {
    try {
        const userId = req.userId;
        const logs = await fitnessModel.find({ userId }).sort({ date: -1 });

        res.status(200).json({ logs });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const saveFitnessProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { weight, height, fitnessGoal, activityLevel, sleepHours, dietPreferences, dietPlan, targetCalories, targetProtein, targetBurn } = req.body;

        const existingProfile = await fitnessProfileModel.findOne({ userId });

        let updateData = { weight, height, fitnessGoal, activityLevel, sleepHours, dietPreferences, dietPlan, targetCalories, targetProtein, targetBurn };

        if (existingProfile && existingProfile.dietPlan && existingProfile.dietPlan !== dietPlan) {
            updateData.$push = {
                pastPlans: {
                    dietPlan: existingProfile.dietPlan,
                    targetCalories: existingProfile.targetCalories,
                    targetProtein: existingProfile.targetProtein,
                    targetBurn: existingProfile.targetBurn,
                    createdAt: existingProfile.updatedAt || new Date()
                }
            };
        }

        const profile = await fitnessProfileModel.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );

        res.status(200).json({ message: "Fitness profile saved successfully", profile });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getFitnessProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const profile = await fitnessProfileModel.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json({ profile });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
