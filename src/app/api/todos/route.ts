import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: [{ completed: 'asc' }, { targetDate: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ todos });
  } catch (error) {
    console.error('Fetch todos error:', error);
    return NextResponse.json({ error: 'To-Do 목록 조회 실패' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요한 작업입니다.' }, { status: 401 });
    }

    const { title, department, targetDate, memo } = await req.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '과업 제목을 입력해주세요.' }, { status: 400 });
    }

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        department: department || user.department || '공통',
        targetDate: targetDate || null,
        memo: memo || null,
        userId: user.userId,
      },
    });

    return NextResponse.json({ success: true, todo });
  } catch (error) {
    console.error('Create todo error:', error);
    return NextResponse.json({ error: 'To-Do 등록 실패' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요한 작업입니다.' }, { status: 401 });
    }

    const { id, completed, title, department, targetDate } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: {
        ...(completed !== undefined ? { completed } : {}),
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(department !== undefined ? { department } : {}),
        ...(targetDate !== undefined ? { targetDate } : {}),
      },
    });

    return NextResponse.json({ success: true, todo: updated });
  } catch (error) {
    console.error('Update todo error:', error);
    return NextResponse.json({ error: 'To-Do 수정 실패' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요한 작업입니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
    }

    await prisma.todo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete todo error:', error);
    return NextResponse.json({ error: 'To-Do 삭제 실패' }, { status: 500 });
  }
}
