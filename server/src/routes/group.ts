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


router.post('/', verifyToken, async (req: any, res: any) => {
    try {
        const { title, userids, allnames } = req.body; // Data from your frontend
        const creatorId = req.user.id;

        if (!Array.isArray(userids)) {
            return res.status(400).json({ message: 'userids must be an array' });
        }

        if (!userids.includes(creatorId)) {
            return res.status(400).json({ message: 'Creator must be included in the group members' });
        }

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ message: 'Group title is required' });
        }
        
        const newGroup = await prisma.group.create({
            data: {
                title,
                userids, // Assuming you want to create a group with the provided users
                allnames, // Include the allnames field in the group creation
                creatorId, // Include the creatorId field in the group creation
                createdAt: new Date(Date.now()) // Set the creation date to now
            }
        });

        res.status(201).json(newGroup); // Sending the "success" back to the frontend
    } catch (err) {
        res.status(500).json({ message: 'Failed to create group' });
    }
});

// Add a member to a group (creator only)
router.patch('/:id/members/add', verifyToken, async (req: any, res: any) => {
    try {
        const groupId = parseInt(req.params.id);
        const currentUserId = req.user.id;
        const { username } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: 'Username is required' });
        }

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.creatorId !== currentUserId) {
            return res.status(403).json({ message: 'Only the creator can manage members' });
        }

        const userToAdd = await prisma.user.findUnique({ where: { username } });
        if (!userToAdd) return res.status(404).json({ message: 'User not found' });

        if (group.userids.includes(userToAdd.id)) {
            return res.status(409).json({ message: 'User is already in this group' });
        }

        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: {
                userids: [...group.userids, userToAdd.id],
                allnames: [...group.allnames, userToAdd.username]
            }
        });

        return res.json(updatedGroup);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to add member' });
    }
});

// Remove a member from a group (creator only)
router.patch('/:id/members/remove', verifyToken, async (req: any, res: any) => {
    try {
        const groupId = parseInt(req.params.id);
        const currentUserId = req.user.id;
        const { username } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: 'Username is required' });
        }

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.creatorId !== currentUserId) {
            return res.status(403).json({ message: 'Only the creator can manage members' });
        }

        const userToRemove = await prisma.user.findUnique({ where: { username } });
        if (!userToRemove) return res.status(404).json({ message: 'User not found' });

        if (!group.userids.includes(userToRemove.id)) {
            return res.status(404).json({ message: 'User is not in this group' });
        }

        if (group.creatorId === userToRemove.id) {
            return res.status(400).json({ message: 'Creator cannot be removed from their own group' });
        }

        const remainingIds = group.userids.filter((id: number) => id !== userToRemove.id);

        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: {
                userids: remainingIds,
                allnames: group.allnames.filter((name: string) => name !== userToRemove.username)
            }
        });

        return res.json(updatedGroup);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to remove member' });
    }
});


// User leaves a group
router.patch('/:id/leave', verifyToken, async (req: any, res: any) => {
    try {
        const groupId = parseInt(req.params.id);
        const userId = req.user.id;

        const person = await prisma.user.findUnique({ where: { id: userId } });
        if (!person) return res.status(404).json({ message: 'User not found' });

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ message: 'Group not found' });
        
        const numberOfUsersInGroup = group.userids.length;

        await prisma.group.update({
            where: { id: groupId },
            data: {
                userids: group.userids.filter((id: number) => id !== userId),
                allnames: group.allnames?.filter((name: string) => name !== person.username)
            }
        });

        if (numberOfUsersInGroup - 1 <= 0) {
            await prisma.group.delete({ where: { id: groupId } });
        }

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