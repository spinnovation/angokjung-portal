import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: '로그아웃되었습니다.' });
  response.cookies.set('angok_auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
