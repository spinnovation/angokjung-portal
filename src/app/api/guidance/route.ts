import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const list = await prisma.guidance.findMany({
      orderBy: { date: 'desc' },
      take: 20,
    });
    return NextResponse.json({ guidance: list });
  } catch (error) {
    console.error('Fetch guidance error:', error);
    return NextResponse.json({ error: '생활지도 목록 조회 실패' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요한 작업입니다.' }, { status: 401 });
    }

    const { date, time, location, teacherName, note } = await req.json();
    if (!date || !teacherName) {
      return NextResponse.json({ error: '날짜와 담당교사를 입력해주세요.' }, { status: 400 });
    }

    const item = await prisma.guidance.create({
      data: {
        date,
        time: time || '',
        location: location || '',
        teacherName,
        note: note || '',
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Create guidance error:', error);
    return NextResponse.json({ error: '생활지도 등록 실패' }, { status: 500 });
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

    await prisma.guidance.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete guidance error:', error);
    return NextResponse.json({ error: '생활지도 삭제 실패' }, { status: 500 });
  }
}
