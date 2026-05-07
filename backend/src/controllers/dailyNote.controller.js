import DailyNoteModel from "../models/dailyNote.model.js";

export const getDailyNote = async (req, res) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        const user = req.userId;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const dailyNote = await DailyNoteModel.findOne({ user, date });
        res.status(200).json({ dailyNote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveDailyNote = async (req, res) => {
    try {
        const { date, note, mood } = req.body;
        const user = req.userId;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const dailyNote = await DailyNoteModel.findOneAndUpdate(
            { user, date },
            { note, mood },
            { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: "Daily note saved successfully", dailyNote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecentDailyNotes = async (req, res) => {
    try {
        const user = req.userId;
        // Fetch last 7 days of notes for analytics
        const past7Days = new Date();
        past7Days.setDate(past7Days.getDate() - 7);
        const dateStr = past7Days.toISOString().split('T')[0];

        const notes = await DailyNoteModel.find({ user, date: { $gte: dateStr } }).sort({ date: -1 });
        res.status(200).json({ notes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
