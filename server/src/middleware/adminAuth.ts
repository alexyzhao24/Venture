import type { Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

export const verifyAdmin = async (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: "Access Denied." });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id
        },
    });

    if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Access Denied." });
    }

    next();
};