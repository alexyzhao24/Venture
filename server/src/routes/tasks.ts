import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, async (req: any, res: any) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { authorId: req.user.id || null},
            orderBy: { points: 'asc' }
        });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
});

router.post('/', async (req, res) => {
    try {
        const { authorId, title, description, points } = req.body; // Data from your frontend
        
        const newTask = await prisma.task.create({
            data: {
                authorId,
                title,
                description,
                points: parseInt(points, 10) // Saving it to the DB via Prisma
            }
        });

        res.status(201).json(newTask); // Sending the "success" back to the frontend
    } catch (err) {
        res.status(500).json({ message: 'Failed to create task' });
    }
});

export default router;