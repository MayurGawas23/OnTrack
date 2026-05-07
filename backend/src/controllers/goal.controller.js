import GoalModel from "../models/goal.model.js";

export const createGoal = async (req, res) =>{
    // console.log(req.body)
    const {goal_title , goal_description, goal_category, startDate, targetDate, endDate, goal_status} = req.body
    const user = req.userId
    // console.log("userid", user)

    try {
        const goal = await GoalModel.create({
            user: user,
            goal_title,
            goal_description,
            goal_category,
            startDate,
            targetDate,
            endDate, 
            goal_status            
        })

        res.status(201).json({
            message:'Goal created succesfully',
            goal
        })
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

export const getGoals = async (req, res) =>{
    const user = req.userId

    try {
        const goals = await GoalModel.find({user})

        res.status(200).json({
            message:"Goals fetched successfully",
            goals        
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}

export const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { goal_title, goal_description, goal_category, targetDate, goal_status } = req.body;
        
        const goal = await GoalModel.findOneAndUpdate(
            { _id: id, user: req.userId },
            { goal_title, goal_description, goal_category, targetDate, goal_status },
            { returnDocument: 'after' }
        );
        
        if (!goal) return res.status(404).json({ message: "Goal not found or unauthorized" });
        
        res.status(200).json({ message: "Goal updated successfully", goal });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await GoalModel.findOneAndDelete({ _id: id, user: req.userId });
        
        if (!goal) return res.status(404).json({ message: "Goal not found or unauthorized" });
        
        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}