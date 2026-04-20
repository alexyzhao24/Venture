import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { register, login } from '../controllers/authController.js';
import prisma from '../lib/prisma.js'
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', verifyToken, async(req: Request, res: Response)=> {
    const userId = (req as AuthenticatedRequest).user.id;
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            username: true,
            email: true,
            isAdmin: true,
        }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
})

authRouter.get('/user/:username', verifyToken, async (req: Request, res: Response) => {
    const username = String(req.params.username ?? '').trim();

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
})

authRouter.get('/user/id/:id', verifyToken, async (req: Request, res: Response) => {
    const id = Number.parseInt(String(req.params.id), 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


export default authRouter;
