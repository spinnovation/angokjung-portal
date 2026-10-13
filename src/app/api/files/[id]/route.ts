import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileRecord = await prisma.fileRecord.findUnique({
      where: { id },
    });

    if (!fileRecord) {
      return NextResponse.json({ error: '파일 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', fileRecord.savedName);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const encodedFilename = encodeURIComponent(fileRecord.originalName);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': fileRecord.fileType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch {
      return NextResponse.json({ error: '서버에 실제 파일이 존재하지 않습니다.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: '파일 다운로드 중 오류가 발생했습니다.' }, { status: 500 });
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
    const fileRecord = await prisma.fileRecord.findUnique({
      where: { id },
    });

    if (!fileRecord) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Only uploader or admin can delete
    if (fileRecord.userId && fileRecord.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: '본인이 업로드한 파일만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    // Delete physical file
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileRecord.savedName);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn('Physical file not found during deletion, removing DB record anyway:', err);
    }

    // Delete DB record
    await prisma.fileRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '파일이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: '파일 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
