import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/:userids', async (req, res) => {
  try {
    const { userids } = req.params;

    if (!userids) return res.json([]);
    
    const idArray = userids.split(',')
    .map(id => Number(id))
    .filter(id => !isNaN(id));
  
    const scores = await prisma.user.findMany({
      where:{ 
        id: { 
          in: idArray
        } 
      },
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