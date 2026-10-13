import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const block = await prisma.block.findUnique({
      where: { id },
      include: {
        category: true,
        files: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!block) {
      return NextResponse.json({ error: '블록을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ block });
  } catch (error) {
    console.error('Get block error:', error);
    return NextResponse.json({ error: '블록 정보 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요한 작업입니다.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description } = body;

    const updated = await prisma.block.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() } : {}),
      },
    });

    return NextResponse.json({ success: true, block: updated });
  } catch (error) {
    console.error('Update block error:', error);
    return NextResponse.json({ error: '블록 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요한 작업입니다.' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.block.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '블록이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete block error:', error);
    return NextResponse.json({ error: '블록 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
