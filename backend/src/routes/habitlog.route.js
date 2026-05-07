import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getLogs, logHabit } from "../controllers/habitLog.controller.js";

const router = Router()

router.post('/log',authMiddleware, logHabit)
router.get('/',authMiddleware, getLogs)

export default router