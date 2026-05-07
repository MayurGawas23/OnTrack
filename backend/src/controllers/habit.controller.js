import HabitModel from "../models/habit.model.js";

export const createHabit = async (req, res) =>{
    const { habit_title , frequency, target_value , goalId, points } =  req.body
    const user = req.userId
    
    try {
        console.log(req.body)
        const habit = await HabitModel.create({
            user,
            habit_title,
            frequency,
            target_value,
            goalId: goalId || null,
            points
        })

        res.status(201).json({
            messsage:'Habit created Successfully',
            habit
        })
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
}

export const getHabits = async(req, res) =>{
    const user = req.userId
    try {
        const habits = await HabitModel.find({user})

        res.status(200).json({
            message:"Habits fetched successfully",
            habits
        })
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
}

export const getHabitsByGoal = async (req, res) => {
    const goalId = req.params.goalId
    const user = req.userId
    console.log(goalId)

    if(!goalId){
        res.status(404).json({message:'No Habits with Goals'})
    }

    try {
        const habits = await HabitModel.find({goalId, user})
        res.status(200).json({
            message:'habits under goal fetched successfully',
            habits
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
};

export const saveHabits = async (req, res) => {
  try {
    const { goalId, habits } = req.body;

    const created = await Promise.all(
      habits.map((h) =>
        HabitModel.create({
          goal: goalId,
          title: h.title,
          description: h.description,
        })
      )
    );

    res.json({ success: true, habits: created });
  } catch (err) {
    res.status(500).json({ message: "Save failed" });
  }
};

export const updateHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const { habit_title, frequency, target_value, points } = req.body;
        
        const habit = await HabitModel.findOneAndUpdate(
            { _id: id, user: req.userId },
            { habit_title, frequency, target_value, points },
            { returnDocument: 'after' }
        );
        
        if (!habit) return res.status(404).json({ message: "Habit not found or unauthorized" });
        
        res.status(200).json({ message: "Habit updated successfully", habit });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deleteHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const habit = await HabitModel.findOneAndDelete({ _id: id, user: req.userId });
        
        if (!habit) return res.status(404).json({ message: "Habit not found or unauthorized" });
        
        res.status(200).json({ message: "Habit deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}