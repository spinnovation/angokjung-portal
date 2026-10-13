import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요한 작업입니다.' }, { status: 401 });
    }

    const { categoryId, title, description } = await req.json();
    if (!categoryId || !title || !title.trim()) {
      return NextResponse.json(
        { error: '카테고리와 블록 제목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    const lastBlock = await prisma.block.findFirst({
      where: { categoryId },
      orderBy: { sortOrder: 'desc' },
    });

    const newSortOrder = (lastBlock?.sortOrder ?? 0) + 1;

    const block = await prisma.block.create({
      data: {
        categoryId,
        title: title.trim(),
        description: description?.trim() || null,
        sortOrder: newSortOrder,
      },
      include: {
        files: true,
      },
    });

    return NextResponse.json({ success: true, block });
  } catch (error) {
    console.error('Create block error:', error);
    return NextResponse.json({ error: '블록 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
