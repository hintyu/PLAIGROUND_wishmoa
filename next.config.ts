import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 네이버 쇼핑
      { protocol: 'https', hostname: 'shop-phinf.pstatic.net' },
      { protocol: 'https', hostname: 'shopping-phinf.pstatic.net' },
      { protocol: 'https', hostname: '*.pstatic.net' },
      // 카카오
      { protocol: 'https', hostname: '*.kakaocdn.net' },
      // 쿠팡
      { protocol: 'https', hostname: 'thumbnail*.coupangcdn.com' },
      { protocol: 'https', hostname: '*.coupangcdn.com' },
      // 11번가
      { protocol: 'https', hostname: '*.11st.co.kr' },
      // G마켓/옥션
      { protocol: 'https', hostname: '*.gmarket.co.kr' },
      { protocol: 'https', hostname: '*.auction.co.kr' },
      // 기타 일반적인 이미지 호스트
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      // Vercel Blob Storage
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
