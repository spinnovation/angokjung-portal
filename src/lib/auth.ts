import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'angokjung-secret-key-teacher-portal-2026-auth';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  department?: string | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest): Promise<TokenPayload | null> {
  // 1. Try Authorization header
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) return decoded;
    }
  }

  // 2. Try cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('angok_auth_token')?.value;
    if (token) {
      return verifyToken(token);
    }
  } catch {
    // If called outside request context
  }

  return null;
}
