import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Create or upsert test teachers
  const passwordHash = await bcrypt.hash('teacher1234!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@angok.es.kr' },
    update: {},
    create: {
      email: 'admin@angok.es.kr',
      name: '관리교사 (교무기획부)',
      department: '교무기획부',
      passwordHash,
      role: 'admin',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@angok.es.kr' },
    update: {},
    create: {
      email: 'teacher@angok.es.kr',
      name: '김선생 (1학년부)',
      department: '1학년부',
      passwordHash,
      role: 'teacher',
    },
  });

  console.log('Created users:', admin.email, teacher.email);

  // 2. Clear existing categories and blocks if any
  await prisma.fileRecord.deleteMany();
  await prisma.block.deleteMany();
  await prisma.category.deleteMany();

  // 3. Categories and Blocks definition
  const categoryData = [
    {
      title: 'Info List',
      icon: 'Info',
      badgeColor: 'blue',
      sortOrder: 1,
      blocks: [
        '연간 학사 일정',
        '월중계획',
        '전체교사시간표',
        '조직현황&업무분장',
        '복무 및 초과근무 처리 절차',
        '위임전결규정(개정후)',
        '교무실배치 & 내선번호 & 교실배치',
        '교직원명부(연수사인 시)',
        '교환수업 방법 & 결보강',
        '공무외국여행 상신방법(휴업일 연가)',
        '물품구입 품의 안내',
        '시설실 이용 안내',
        '보건실 이용 안내',
        '청소구역 & 분리수거',
        '급식지도',
        '학교 종합감사 수감자료 - 업무참고용',
        '안전공제 신청',
      ],
    },
    {
      title: '안곡중 Work',
      icon: 'Briefcase',
      badgeColor: 'purple',
      sortOrder: 2,
      blocks: [
        '부서별 운영계획 운영자료(워크숍 자료)',
        '안곡중 교육계획서',
        '안곡중학교 규정집',
        '학생생활규정',
        '학업성적관리규정',
        '교육과정 & 생기부 작성',
        '수업 계획 & 평가',
        '교직원 연수 이수 현황',
        '출결 & 학적 관련',
        '교문지도 & 급식지도',
        '대회 & 행사 계획서 모음',
        '각종 학교 업무 관련 자료 모음',
        '업무용오피스',
      ],
    },
    {
      title: '교육 & 업무 관련 자료',
      icon: 'FileText',
      badgeColor: 'emerald',
      sortOrder: 3,
      blocks: [
        '학교업무메뉴얼(중등)',
        '학교생활기록부 기재요령(중학교)',
        '학적 길라잡이',
        '교권 & 학폭 생활지도',
        '교육 & 에듀테크 관련 자료',
        '디지털 원패스 & 구글 워크스페이스',
        'e-DASAN 현장지원',
        '(교데통) 교육행정데이터통합관리시스템 메뉴얼',
        '나이스 지원 서비스 이용 방법',
        '경기도 고등학교 입학 내신성적 반영지침 예고(안)',
        '기타 교육청 자료',
        '랑톡 메뉴얼',
      ],
    },
    {
      title: '교원역량계발지원제도 연구학교',
      icon: 'GraduationCap',
      badgeColor: 'amber',
      sortOrder: 4,
      blocks: [
        '연수 지원',
        '나의 수업 릴레이',
        '안곡중 공유드라이브',
        '교내공개수업',
        '안곡중 교원역량 도서 인증제',
        '교원역량개발지원제도 연구회',
      ],
    },
    {
      title: '학교 기자재 관리 자료',
      icon: 'Monitor',
      badgeColor: 'rose',
      sortOrder: 5,
      blocks: [
        '교사용 노트북 수리, 교실 기자재 수리',
        '학생 무선 인터넷 주소',
        '학생 태블릿 PC & 충전함',
        '교실 TV 수리',
        '태블릿 PC 화면 공유 안 될 때 해결 방법',
        '개인 노트북 IP 설정 방법',
        '2026년 사용 예정 학습지원 소프트웨어 심의 목록(안곡중)',
        '안곡중 에듀테크 모음',
        '메신저 사용 안내',
        '교육용 클라우드 이용 방법',
        '크롬북 인터넷 연결 문제시 조치법',
      ],
    },
  ];

  for (const cat of categoryData) {
    const createdCat = await prisma.category.create({
      data: {
        title: cat.title,
        icon: cat.icon,
        badgeColor: cat.badgeColor,
        sortOrder: cat.sortOrder,
      },
    });

    for (let i = 0; i < cat.blocks.length; i++) {
      const blockTitle = cat.blocks[i];
      await prisma.block.create({
        data: {
          categoryId: createdCat.id,
          title: blockTitle,
          sortOrder: i + 1,
          description: `${blockTitle} 관련 공문서, 양식 및 안내 파일`,
        },
      });
    }
  }

  // 4. Initial Guidance records
  await prisma.guidance.deleteMany();
  await prisma.guidance.createMany({
    data: [
      {
        date: '2026-03-03',
        time: '08:20 ~ 08:50',
        location: '정문 및 후문',
        teacherName: '김안곡',
        note: '개학일 학생 맞이 및 등교 안전 지도',
      },
      {
        date: '2026-03-03',
        time: '12:40 ~ 13:20',
        location: '급식실 2층',
        teacherName: '이교무',
        note: '학년별 급식 순서 지도 및 질서 유지',
      },
      {
        date: '2026-03-04',
        time: '08:20 ~ 08:50',
        location: '중앙 현관',
        teacherName: '박생활',
        note: '실내화 착용 및 교복 단정 지도',
      },
    ],
  });

  // 5. Initial Todo items
  await prisma.todo.deleteMany();
  await prisma.todo.createMany({
    data: [
      {
        title: '2026학년도 1학기 교육계획서 부서별 취합',
        department: '교무기획부',
        targetDate: '2026-03-10',
        completed: false,
        memo: '각 부서 부장님 제출 요망',
      },
      {
        title: '학생 태블릿 PC 분출 및 전산망 점검',
        department: '교육정보부',
        targetDate: '2026-03-08',
        completed: true,
        memo: '충전함 번호 부여 완료',
      },
      {
        title: '연간 학사일정 달력 최종 배부',
        department: '교육연구부',
        targetDate: '2026-03-05',
        completed: false,
        memo: '교무실 비치본 인쇄',
      },
      {
        title: '1학년 신입생 교과서 배부 현황 점검',
        department: '1학년부',
        targetDate: '2026-03-04',
        completed: false,
        memo: '파손본 교환 신청 접수',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
