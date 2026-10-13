import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        role: true,
      },
    });

    return NextResponse.json({ user: user || null });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null });
  }
}
