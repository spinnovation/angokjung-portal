import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' },
          include: {
            files: {
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                originalName: true,
                savedName: true,
                fileType: true,
                fileSize: true,
                memo: true,
                uploaderName: true,
                createdAt: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요한 작업입니다.' }, { status: 401 });
    }

    const { title, badgeColor, icon } = await req.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '카테고리 제목을 입력해주세요.' }, { status: 400 });
    }

    const count = await prisma.category.count();
    const newCategory = await prisma.category.create({
      data: {
        title: title.trim(),
        badgeColor: badgeColor || 'blue',
        icon: icon || 'Folder',
        sortOrder: count + 1,
      },
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: '카테고리 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
