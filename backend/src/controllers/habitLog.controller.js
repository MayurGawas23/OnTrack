import HabitLogModel from "../models/habitLog.model.js";

export const logHabit = async (req, res) => {
  try {
    const { habitId, status, date } = req.body;
  
    const log = await HabitLogModel.findOneAndUpdate(
      {
        habit: habitId,
        date,
        user: req.userId,
      },
      {
        status,
      },
      { returnDocument: 'after', upsert: true }
    );

    res.json({
        message:"habit logged successfully",
        log
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLogs = async (req, res) => {
  try {
    const logs = await HabitLogModel.find({ user: req.userId });
   res.json({
        message:"logged habits fetched successfully",
        logs
    });
  } catch (error) {
    return res.status(400).json({message:error.message})
  }
};