import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/:userids', async (req, res) => {
  try {
    const userIds = req.params.userids.split(',').map(Number);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        completions: {
          include: { task: true }
        }
      }
    });

    const scores = users.map(user => ({
      id: user.id,
      username: user.username,
      points: user.completions.reduce((sum, c) => sum + c.task.points, 0),
      tasksCompleted: user.completions.length,
    })).sort((a, b) => b.points - a.points);
    res.json(scores);
  } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;