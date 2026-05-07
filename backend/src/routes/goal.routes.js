import { Router } from "express";
import { createGoal, getGoals, updateGoal, deleteGoal } from "../controllers/goal.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/create_goal', authMiddleware, createGoal)
router.get('/get_goals', authMiddleware, getGoals)
router.put('/:id', authMiddleware, updateGoal)
router.delete('/:id', authMiddleware, deleteGoal)

export default router