import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import leaderboardRouter from './routes/leaderboard.js';
import tasksRouter from './routes/tasks.js';
import groupRouter from './routes/group.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter)
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/groups', groupRouter);

// Basic health check route
app.get('/', (req: Request, res: Response) => {
  res.send('Venture API is sprinting! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
