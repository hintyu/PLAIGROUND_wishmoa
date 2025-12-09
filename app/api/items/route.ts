import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 선물 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, itemTitle, itemUrl, itemImage, itemPrice } = body;

    // 유효성 검사
    if (!projectId) {
      return NextResponse.json({ error: '프로젝트 정보가 필요합니다.' }, { status: 400 });
    }
    if (!itemTitle?.trim()) {
      return NextResponse.json({ error: '선물 이름을 입력해주세요.' }, { status: 400 });
    }
    if (!itemUrl?.trim()) {
      return NextResponse.json({ error: '상품 링크를 입력해주세요.' }, { status: 400 });
    }
    if (!itemPrice || itemPrice <= 0) {
      return NextResponse.json({ error: '목표 금액을 입력해주세요.' }, { status: 400 });
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

    // 현재 최대 order 가져오기
    const maxOrder = await prisma.item.aggregate({
      where: { projectId },
      _max: { itemOrder: true },
    });

    const newOrder = (maxOrder._max.itemOrder || 0) + 1;

    // 선물 생성
    const item = await prisma.item.create({
      data: {
        projectId,
        itemTitle: itemTitle.trim(),
        itemUrl: itemUrl.trim(),
        itemImage: itemImage?.trim() || null,
        itemPrice,
        itemOrder: newOrder,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('선물 생성 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


