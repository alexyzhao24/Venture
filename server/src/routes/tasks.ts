import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user.id;
        const tasks = await prisma.task.findMany({
            where: { 
                OR: [
                    { authorId: userId },
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

router.get('/group/:groupId', async (req: Request, res: Response) => {
    try {
        const groupId = Number.parseInt(String(req.params.groupId), 10);

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

router.patch('/:id/complete', verifyToken, async (req: Request, res: Response) => {
    try {
        const taskId = Number.parseInt(String(req.params.id), 10);
        const userId = (req as AuthenticatedRequest).user.id;

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

router.patch('/delete', verifyToken, async (_req: Request, res: Response) => {
    try {
        const completedTasks = await prisma.task.findMany({
            where: { completed: true }
        });

        const now = new Date();

        for (let task of completedTasks) {
            if (!task.completedAt) continue;

            const timeElapsed = now.getTime() - task.completedAt.getTime();
            console.log(`Task ID ${task.id} completed at ${task.completedAt}, time elapsed: ${timeElapsed}ms`);

            // After 6 hours of completion, hide tasks
            if (timeElapsed > 6 * 60 * 60 * 1000 && (task.once || task.daily || task.weekly || task.biweekly || task.monthly)) {
                
                if (task.daily){
                    await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: true, permRemove: true}
                });
                } else{
                    await prisma.task.update({
                        where: { id: task.id },
                        data: { hidden: true }
                    });
                }
            }


            // After 24 hours, show daily tasks unless marked as permRemove
            if (timeElapsed > 24 * 60 * 60 * 1000 && (task.daily) && !task.permRemove) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: false, completed: false, completedAt: null}
                });
            }

            // After 7 days, show weekly tasks unless marked as permRemove
            if (timeElapsed > 7 * 24 * 60 * 60 * 1000 && (task.weekly) && !task.permRemove) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: false, completed: false, completedAt: null }
                });
            }

            // After 14 days, show biweekly tasks unless marked as permRemove           
            if (timeElapsed > 14 * 24 * 60 * 60 * 1000 && (task.biweekly) && !task.permRemove) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { hidden: false, completed: false, completedAt: null }
                });
            }

            // After 30 days, show monthly tasks unless marked as permRemove
            if (timeElapsed > 30 * 24 * 60 * 60 * 1000 && (task.monthly) && !task.permRemove) {
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

router.patch('/:taskId/hide', verifyToken, async (req: Request, res: Response) => {
    const taskId = Number.parseInt(String(req.params.taskId), 10);

    if (Number.isNaN(taskId)) {
        return res.status(400).json({ message: 'Invalid task id' });
    }

    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { hidden: true, permRemove: true}
        });

        res.json({ message: 'Task hidden successfully', updatedTask });
    } catch (err) {
        res.status(500).json({ message: 'Failed to hide task' });
    }
});


router.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const { title, description, points, once, daily, weekly, biweekly, monthly } = req.body; // Data from your frontend
        const authorId = (req as AuthenticatedRequest).user.id;
        
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