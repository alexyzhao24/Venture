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

export default authRouter;
