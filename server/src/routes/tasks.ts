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

router.patch('/:id/complete', verifyToken, async (req: any, res: any) => {
    try {
        const taskId = parseInt(req.params.id);
        const userId = req.user.id;

        // Create a UserTask record to track completion
        const userTask = await prisma.userTask.create({
            data: {
                userId: userId,
                taskId: taskId,
            }
        });

        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                completed: true,
                completedAt: new Date(Date.now()),
                timesRepeated: { increment: 1 },
            },
        });

        res.json({ message: 'Task completed successfully', updatedTask, userTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to complete task' });
    }
});

router.patch('/delete', verifyToken, async (req: any, res: any) => {
    try {
        const completedTasks = await prisma.task.findMany({
            where: { completed: true }
        });

        const now = new Date();

        for (let task of completedTasks) {
            if (!task.completedAt) continue;

            const timeElapsed = now.getTime() - task.completedAt.getTime();
            console.log(`Task ID ${task.id} completed at ${task.completedAt}, time elapsed: ${timeElapsed}ms`);

            // After 6 hours, handle once tasks and delete them entirely
            if (timeElapsed > 6 * 60 * 60 * 1000 && (task.once)) {
                await prisma.userTask.deleteMany({ where: { taskId: task.id } });
                await prisma.task.delete({ where: { id: task.id } });
                continue;
            }
            
            // After 6 hours, hide repeating tasks
            if (timeElapsed > 6 * 60 * 60 * 1000 && (task.daily || task.weekly || task.biweekly || task.monthly)) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: true }
                });
            }

            // After 24 hours, show daily tasks
            if (timeElapsed > 24 * 60 * 60 * 1000 && (task.daily)) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: false, completed: false, completedAt: null}
                });
            }

            // After 7 days, show weekly tasks
            if (timeElapsed > 7 * 24 * 60 * 60 * 1000 && (task.weekly)) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: false, completed: false, completedAt: null }
                });
            }

            // After 14 days, show biweekly tasks           
            if (timeElapsed > 14 * 24 * 60 * 60 * 1000 && (task.biweekly)) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: false, completed: false, completedAt: null }
                });
            }

            // After 30 days, show monthly tasks
            if (timeElapsed > 30 * 24 * 60 * 60 * 1000 && (task.monthly)) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: false, completed: false, completedAt: null }
                });
            }
        }
        res.json({ message: 'Cleanup finished' });
    } catch (err) {
        res.status(500).json({ message: 'Cleanup failed' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { authorId, title, description, points, once, daily, weekly, biweekly, monthly } = req.body; // Data from your frontend
        
        const newTask = await prisma.task.create({
            data: {
                authorId,
                title,
                description,
                points: parseInt(points, 10), // Saving it to the DB via Prisma
                once: Boolean(once),
                daily: Boolean(daily),
                weekly: Boolean(weekly),
                biweekly: Boolean(biweekly),
                monthly: Boolean(monthly),
                hidden: false,
            }
        });

        res.status(201).json(newTask); // Sending the "success" back to the frontend
    } catch (err) {
        res.status(500).json({ message: 'Failed to create task' });
    }
});

export default router;