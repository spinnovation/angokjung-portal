import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, department, schoolCode } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 성함을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: '비밀번호는 최소 4자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // Optional school verification code (default: angok2026 or empty)
    if (schoolCode && schoolCode !== 'angok2026' && schoolCode !== '안곡중') {
      return NextResponse.json(
        { error: '학교 인증코드가 올바르지 않습니다. (안내: angok2026 또는 안곡중)' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일 주소입니다.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        department: department || '일반교사',
        role: email.includes('admin') ? 'admin' : 'teacher',
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        role: user.role,
      },
    });

    response.cookies.set('angok_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
