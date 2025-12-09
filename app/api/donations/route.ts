import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 후원 생성 (비로그인도 가능)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, donatorNm, donatorMessage, donationAmount } = body;

    // 유효성 검사
    if (!itemId) {
      return NextResponse.json({ error: '상품 정보가 필요합니다.' }, { status: 400 });
    }
    if (!donatorNm?.trim()) {
      return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });
    }
    if (!donationAmount || donationAmount <= 0) {
      return NextResponse.json({ error: '후원 금액을 입력해주세요.' }, { status: 400 });
    }

    // 아이템 존재 확인
    const item = await prisma.item.findUnique({
      where: { itemId },
    });

    if (!item || item.itemStatus === 'deleted') {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 후원 생성
    const donation = await prisma.donation.create({
      data: {
        itemId,
        donatorNm: donatorNm.trim(),
        donatorMessage: donatorMessage?.trim() || null,
        donationAmount,
        donationStatus: 'pending', // 기본값: 대기 (관리자 확인 후 confirmed)
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error('후원 생성 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


