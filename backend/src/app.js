import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import express from 'express'
import UserRoutes from './routes/user.routes.js'
import GoalRoutes from './routes/goal.routes.js'
import HabitRoutes from './routes/habit.routes.js'
import HabitLogRoutes from './routes/habitlog.route.js'
import AIRoutes from './routes/ai.routes.js'
import FitnessRoutes from './routes/fitness.routes.js'
import DailyNoteRoutes from './routes/dailyNote.routes.js'
import cookieParser from 'cookie-parser'
// import GenerateHabit from './lib/gen_ai.js'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: ["http://localhost:5173", "https://on-track-orcin.vercel.app"],
    credentials: true,
  })
);


app.get('/', (req, res)=>{
    res.send("server running")
})

app.use('/api/users', UserRoutes)
app.use('/api/goals', GoalRoutes)
app.use('/api/habits', HabitRoutes)
app.use('/api/habitlog', HabitLogRoutes)
app.use('/api/ai', AIRoutes)
app.use('/api/fitness', FitnessRoutes)
app.use('/api/dailynote', DailyNoteRoutes)

// GenerateHabit()

export default app;