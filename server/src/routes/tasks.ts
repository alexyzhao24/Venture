import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', async (requestAnimationFrame, res) => {
    try {
        const tasks = await prisma.task.findMany();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, points } = req.body; // Data from your frontend
        
        const newTask = await prisma.task.create({
            data: {
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