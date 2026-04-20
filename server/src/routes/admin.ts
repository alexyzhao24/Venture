import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { verifyAdmin } from '../middleware/adminAuth.js';
import prisma from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/users', verifyToken, verifyAdmin, async (_req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                isAdmin: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
});

router.get('/groups', verifyToken, verifyAdmin, async (_req: Request, res: Response) => {
    try {
        const groups = await prisma.group.findMany({
            orderBy: { id: 'desc' },
            select: {
                id: true,
                title: true,
                allnames: true,
                userids: true,
                creatorId: true,
                createdAt: true,
            },
        });

        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch groups', error });
    }
});

router.delete('/groups/:id', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
    try {
        const groupId = Number.parseInt(String(req.params.id), 10);

        if (Number.isNaN(groupId)) {
            return res.status(400).json({ message: 'Invalid group id' });
        }

        const existingGroup = await prisma.group.findUnique({
            where: { id: groupId },
            select: { id: true, title: true },
        });

        if (!existingGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        await prisma.group.delete({ where: { id: groupId } });

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete group', error });
    }
});

router.delete('/users/:id', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
    try {
        const userId = Number.parseInt(String(req.params.id), 10);

        if (Number.isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        if (userId === (req as AuthenticatedRequest).user.id) {
            return res.status(400).json({ message: "Cannot delete self" });
        }

        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true },
        });

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cleanup = {
            groupsFound: 0,
            groupsUpdated: 0,
            groupsDeleted: 0,
            groupsCreatorCleared: 0,
            userTasksDeleted: 0,
            authoredTasksUnassigned: 0,
        };

        // Keep user deletion atomic to avoid leaving dangling relations.
        await prisma.$transaction(async (tx) => {
            const clearedCreatorGroups = await tx.group.updateMany({
                where: { creatorId: userId },
                data: { creatorId: null },
            });
            cleanup.groupsCreatorCleared = clearedCreatorGroups.count;

            const groupsContainingUser = await tx.group.findMany({
                where: {
                    userids: {
                        has: userId,
                    },
                },
                select: {
                    id: true,
                    userids: true,
                    allnames: true,
                },
            });

            cleanup.groupsFound = groupsContainingUser.length;

            for (const group of groupsContainingUser) {
                const updatedUserIds = group.userids.filter((id) => id !== userId);
                const updatedAllNames = group.allnames.filter((name) => name !== userToDelete.username);

                if (updatedUserIds.length === 0) {
                    await tx.group.delete({ where: { id: group.id } });
                    cleanup.groupsDeleted += 1;
                } else {
                    await tx.group.update({
                        where: { id: group.id },
                        data: {
                            userids: updatedUserIds,
                            allnames: updatedAllNames,
                            users: {
                                disconnect: { id: userId },
                            },
                        },
                    });
                    cleanup.groupsUpdated += 1;
                }
            }

            const deletedUserTasks = await tx.userTask.deleteMany({
                where: { userId },
            });
            cleanup.userTasksDeleted = deletedUserTasks.count;

            const unassignedTasks = await tx.task.updateMany({
                where: { authorId: userId },
                data: { authorId: null },
            });
            cleanup.authoredTasksUnassigned = unassignedTasks.count;

            await tx.user.delete({
                where: { id: userId },
            });
        });

        res.json({
            message: 'User deleted successfully',
            cleanup,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
});

router.patch('/users/:id/admin-status', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
    try {
        const id = Number.parseInt(String(req.params.id), 10);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updated = await prisma.user.update({
            where: { id },
            data: { isAdmin: !user.isAdmin },
            select: { id: true, username: true, isAdmin: true }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
});

export default router;