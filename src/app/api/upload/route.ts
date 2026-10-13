import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';


export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: '로그인한 교직원만 파일을 업로드할 수 있습니다. 먼저 로그인해주세요.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const blockId = formData.get('blockId') as string | null;
    const memo = formData.get('memo') as string | null;

    if (!file) {
      return NextResponse.json({ error: '업로드할 파일을 선택해주세요.' }, { status: 400 });
    }

    if (!blockId) {
      return NextResponse.json({ error: '대상 블록이 지정되지 않았습니다.' }, { status: 400 });
    }

    const block = await prisma.block.findUnique({
      where: { id: blockId },
    });

    if (!block) {
      return NextResponse.json({ error: '존재하지 않는 블록입니다.' }, { status: 404 });
    }

    // 100MB limit check
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '파일 크기는 최대 100MB 이하만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    const originalName = file.name;
    const fileExt = path.extname(originalName).toLowerCase();
    const randomHex = Math.random().toString(36).substring(2, 9);
    const sanitizedBase = path
      .basename(originalName, fileExt)
      .replace(/[^a-zA-Z0-9_\uAC00-\uD7A3-]/g, '_');
    const savedName = `${Date.now()}_${randomHex}_${sanitizedBase}${fileExt}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, savedName);

    await fs.writeFile(filePath, buffer);

    const fileRecord = await prisma.fileRecord.create({
      data: {
        blockId,
        userId: user.userId,
        uploaderName: `${user.name} (${user.department || '교사'})`,
        originalName,
        savedName,
        fileType: file.type || fileExt.replace('.', '') || 'unknown',
        fileSize: file.size,
        memo: memo?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      file: fileRecord,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
