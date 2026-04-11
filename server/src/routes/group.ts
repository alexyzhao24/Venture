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
                allnames, // Include the allnames field in the group creation
                createdAt: new Date(Date.now()) // Set the creation date to now
            }
        });

        res.status(201).json(newGroup); // Sending the "success" back to the frontend
    } catch (err) {
        res.status(500).json({ message: 'Failed to create group' });
    }
});


// User leaves a group
router.patch('/:id/leave', verifyToken, async (req: any, res: any) => {
    try {
        const groupId = parseInt(req.params.id);
        const userId = req.user.id;

        const group = await prisma.group.findUnique({ where: { id: groupId }, include: { users: true } });
        if (!group) return res.status(404).json({ message: 'Group not found' });

        await prisma.group.update({
            where: { id: groupId },
            data: {
                users: { disconnect: { id: userId } },
                userids: group.userids.filter((id: number) => id !== userId),
            }
        });

        res.json({ message: 'Left group successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to leave group' });
    }
});


// Delete a group (creator only)
router.delete('/:id', verifyToken, async (req: any, res: any) => {
    try {
        const groupId = parseInt(req.params.id);
        const userId = req.user.id;

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.creatorId !== userId) return res.status(403).json({ message: 'Only the creator can delete this group' });

        await prisma.group.delete({ where: { id: groupId } });

        res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete group' });
    }
});

export default router;