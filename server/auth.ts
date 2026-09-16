import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import { User } from '../src/types/index.ts';

// Token session store: token -> userId
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function createSessionToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  // 7 days expiration
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  sessions.set(token, { userId, expiresAt });
  return token;
}

export function revokeSessionToken(token: string): void {
  sessions.delete(token);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

export function getUserFromToken(token: string): User | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  const raw = db.getRaw();
  const user = raw.users.find(u => u.id === session.userId);
  if (!user) return null;
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const user = getUserFromToken(token);
  if (user) {
    req.user = user;
    req.token = token;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Acesso não autorizado. Por favor faça login.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Acesso não autorizado. Por favor faça login.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito para administradores.' });
  }
  next();
}
