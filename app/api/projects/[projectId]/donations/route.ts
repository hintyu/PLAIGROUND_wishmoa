import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// 프로젝트의 전체 후원 목록 조회 (소유자만)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 프로젝트 소유권 확인
    const project = await prisma.project.findUnique({
      where: { projectId },
    });

    if (!project) {
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 프로젝트에 속한 모든 아이템의 후원 조회
    const donations = await prisma.donation.findMany({
      where: {
        item: {
          projectId,
        },
      },
      include: {
        item: {
          select: {
            itemId: true,
            itemTitle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error('후원 목록 조회 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


