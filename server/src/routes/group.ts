import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, async (req: any, res: any) => {
    try {
        const tasks = await prisma.group.findMany({
            where: {
                userids: {
                    has: req.user.id  
                }
            },
            orderBy: { title: 'asc' }
        });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
});


router.post('/', async (req, res) => {
    try {
        const { title, userids, allnames } = req.body; // Data from your frontend
        
        const newGroup = await prisma.group.create({
            data: {
                title,
                userids, // Assuming you want to create a group with the provided users
                allnames // Include the allnames field in the group creation
            }
        });

        res.status(201).json(newGroup); // Sending the "success" back to the frontend
    } catch (err) {
        res.status(500).json({ message: 'Failed to create group' });
    }
});

export default router;