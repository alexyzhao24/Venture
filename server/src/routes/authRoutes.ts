import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { register, login } from '../controllers/authController.js';
import prisma from '../lib/prisma.js'

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', verifyToken, async(req: any, res: any)=> {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id
        },
        select: {
            id: true,
            username: true,
            email: true
        }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
})

authRouter.get('/user/:username', verifyToken, async (req: any, res: any) => {
    const { username } = req.params;

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

authRouter.get('/user/:id', verifyToken, async (req: any, res: any) => {
    const { id } = req.params;

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
