import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ itemId: string }>;
}

// 선물 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { itemId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 선물 및 프로젝트 소유권 확인
    const item = await prisma.item.findUnique({
      where: { itemId },
      include: { project: true },
    });

    if (!item) {
      return NextResponse.json({ error: '선물을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (item.project.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { itemTitle, itemUrl, itemImage, itemPrice, itemStatus, itemOrder } = body;

    const updatedItem = await prisma.item.update({
      where: { itemId },
      data: {
        ...(itemTitle && { itemTitle: itemTitle.trim() }),
        ...(itemUrl && { itemUrl: itemUrl.trim() }),
        ...(itemImage !== undefined && { itemImage: itemImage?.trim() || null }),
        ...(itemPrice && { itemPrice }),
        ...(itemStatus && { itemStatus }),
        ...(itemOrder !== undefined && { itemOrder }),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('선물 수정 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 선물 삭제 (소프트 삭제)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { itemId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const item = await prisma.item.findUnique({
      where: { itemId },
      include: { project: true },
    });

    if (!item) {
      return NextResponse.json({ error: '선물을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (item.project.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    await prisma.item.update({
      where: { itemId },
      data: { itemStatus: 'deleted' },
    });

    return NextResponse.json({ message: '선물이 삭제되었습니다.' });
  } catch (error) {
    console.error('선물 삭제 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


