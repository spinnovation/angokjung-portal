import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '안곡중학교 공감(共感) 교원 업무 포털',
  description: '안곡중학교 교직원 업무 및 각 블록별 문서/파일 업로드·다운로드 아카이브',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
