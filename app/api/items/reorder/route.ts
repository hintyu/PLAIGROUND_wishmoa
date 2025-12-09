import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 선물 순서 일괄 변경
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, items } = body as { 
      projectId: string; 
      items: { itemId: string; itemOrder: number }[] 
    };

    if (!projectId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
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

    // 트랜잭션으로 일괄 업데이트
    await prisma.$transaction(
      items.map(({ itemId, itemOrder }) =>
        prisma.item.update({
          where: { itemId },
          data: { itemOrder },
        })
      )
    );

    return NextResponse.json({ message: '순서가 변경되었습니다.' });
  } catch (error) {
    console.error('순서 변경 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

