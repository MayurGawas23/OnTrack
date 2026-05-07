import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getFitnessLogs, logFitness, saveFitnessProfile, getFitnessProfile } from "../controllers/fitness.controller.js";

const router = Router()

router.post('/log', authMiddleware, logFitness)
router.get('/', authMiddleware, getFitnessLogs)

router.post('/profile', authMiddleware, saveFitnessProfile)
router.get('/profile', authMiddleware, getFitnessProfile)

export default router
