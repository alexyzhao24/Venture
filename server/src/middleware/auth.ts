import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: number;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET is missing' });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied." });
  }

  try {
    const verified = jwt.verify(token, jwtSecret);
    if (typeof verified !== 'object' || verified === null || !('id' in verified)) {
      return res.status(403).json({ message: 'Invalid Token' });
    }

    const userId = Number((verified as { id: unknown }).id);
    if (Number.isNaN(userId)) {
      return res.status(403).json({ message: 'Invalid Token' });
    }

    (req as AuthenticatedRequest).user = {
      ...(verified as Record<string, unknown>),
      id: userId,
    } as AuthenticatedUser;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid Token" });
  }
};