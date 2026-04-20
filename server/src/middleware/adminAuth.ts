import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import type { AuthenticatedRequest } from './auth.js';

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Access Denied." });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
    });

    if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Access Denied." });
    }

    next();
};