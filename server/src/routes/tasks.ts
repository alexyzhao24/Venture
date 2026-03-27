import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, async (req: any, res: any) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { 
                OR: [
                    { authorId: req.user.id },
                    { authorId: null }
                ]
            },
            orderBy: { points: 'asc' }
        });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
});

router.get('/group/:groupId', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { users: true }
        });

        if (!group) return res.status(404).json({ message: 'Group not found' });

        const scores = await Promise.all(group.users.map(async (user) => {
            const completions = await prisma.userTask.findMany({
                where: { userId: user.id },
                include: { task: true }
            });

            const points = completions.reduce((sum, c) => sum + c.task.points, 0);

            return {
                id: user.id,
                username: user.username,
                points,
                tasksCompleted: completions.length,
            };
        }));

        scores.sort((a, b) => b.points - a.points);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/:id/complete', verifyToken, async (req: any, res: any) => {
    try {
        const taskId = parseInt(req.params.id);
        const completion = await prisma.userTask.create({
            data: {
                userId: req.user.id,
                taskId,
            }
        });
        res.json({ message: 'Task completed!', completion });
    } catch (err) {
        res.status(500).json({ message: 'Failed to complete task' });
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