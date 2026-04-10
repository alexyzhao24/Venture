import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/:userids/:timeframe', async (req, res) => {
  try {
    const userIds = req.params.userids.split(',').map(Number);
    const timeframeDate = new Date(req.params.timeframe);
    const timeframe = req.params.timeframe;
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        completions: {
          where: { completedAt: { gte: timeframeDate } },
          include: { task: true}
      }}
    });

    console.log(timeframe);

    const scores = users.map(user => ({
      id: user.id,
      username: user.username,
      points: user.completions.reduce((sum, c) => sum + (c.task.points * c.task.timesRepeated), 0),
      tasksCompleted: user.completions.length,
    })).sort((a, b) => b.points - a.points);
    res.json(scores);
  } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;