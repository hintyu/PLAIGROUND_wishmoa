import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ donationId: string }>;
}

// 후원 상태 수정 (소유자만)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { donationId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 후원 및 프로젝트 소유권 확인
    const donation = await prisma.donation.findUnique({
      where: { donationId },
      include: {
        item: {
          include: { project: true },
        },
      },
    });

    if (!donation) {
      return NextResponse.json({ error: '후원을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (donation.item.project.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { donationStatus } = body;

    if (!donationStatus) {
      return NextResponse.json({ error: '상태를 지정해주세요.' }, { status: 400 });
    }

    const updatedDonation = await prisma.donation.update({
      where: { donationId },
      data: { donationStatus },
    });

    return NextResponse.json(updatedDonation);
  } catch (error) {
    console.error('후원 수정 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 후원 삭제 (소프트 삭제)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { donationId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const donation = await prisma.donation.findUnique({
      where: { donationId },
      include: {
        item: {
          include: { project: true },
        },
      },
    });

    if (!donation) {
      return NextResponse.json({ error: '후원을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (donation.item.project.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    await prisma.donation.update({
      where: { donationId },
      data: { donationStatus: 'deleted' },
    });

    return NextResponse.json({ message: '후원이 삭제되었습니다.' });
  } catch (error) {
    console.error('후원 삭제 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


