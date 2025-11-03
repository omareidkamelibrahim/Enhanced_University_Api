import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const ACCESS_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'change_this_too';

export type JWTPayload = { id: number; email: string; role: string };

export function signAccessToken(payload: JWTPayload, expiresIn = '15m') {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn });
}

export function signRefreshToken(payload: JWTPayload, expiresIn = '7d') {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
}

export function getTokenFromHeader(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
}

export async function requireAuth(req: NextRequest) {
  const token = getTokenFromHeader(req);
  if (!token) throw new Error('Unauthorized');
  try {
    const payload = verifyAccessToken(token);
    return payload;
  } catch (e) {
    throw new Error('Invalid token');
  }
}

// helper to rotate and persist refresh token on user record
export async function saveRefreshTokenForUser(userId: number, refreshToken: string) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken } });
}

export async function clearRefreshTokenForUser(userId: number) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}
