import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createHabit, getHabits, getHabitsByGoal, updateHabit, deleteHabit } from "../controllers/habit.controller.js";

const router = Router()

router.post('/create_habit' , authMiddleware, createHabit)
router.get('/get_habits' , authMiddleware, getHabits)
router.get('/goal/:goalId' , authMiddleware, getHabitsByGoal)
router.put('/:id' , authMiddleware, updateHabit)
router.delete('/:id' , authMiddleware, deleteHabit)

export default router