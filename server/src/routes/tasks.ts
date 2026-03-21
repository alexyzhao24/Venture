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


export default router;