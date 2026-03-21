import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const scores = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        _count: {
          select: {
            tasks: {
              where: { completed: true }
            }
          }
        }
      },
      orderBy: {
        tasks: {
          _count: 'desc'
        }
      }
    });
    res.json(scores);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;