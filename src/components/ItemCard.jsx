import { useState, useEffect, useRef } from 'react';
import { getDonationsByItem } from '../services/donationService';

const ItemCard = ({ item, onDonateClick }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isMessageFading, setIsMessageFading] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ x: 0, color: '', lightColor: '' });
  const iconRefs = useRef([]);

  useEffect(() => {
    loadDonations();
  }, [item.item_id, item.id]);

  // 메시지 자동 닫기 (5초 후)
  useEffect(() => {
    if (selectedDonation) {
      setIsMessageFading(false);
      const fadeTimer = setTimeout(() => {
        setIsMessageFading(true);
      }, 4500); // 4.5초 후 페이드 시작
      
      const closeTimer = setTimeout(() => {
        setSelectedDonation(null);
        setIsMessageFading(false);
      }, 5000); // 5초 후 완전히 닫기
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [selectedDonation]);

  const loadDonations = async () => {
    try {
      // item_id가 없으면 Firestore 문서 ID 사용
      const itemId = item.item_id || item.id;
      const donationList = await getDonationsByItem(itemId);
      setDonations(donationList);
    } catch (error) {
      console.error('후원 내역 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // donations 합계로 현재 달성액 계산 (안전하게 0으로 초기화)
  const currAmt = donations?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0;
  const progressPercentage = item.goal_price > 0 
    ? Math.min((currAmt / item.goal_price) * 100, 100) 
    : 0;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 색상을 밝게 변환하는 함수
  const lightenColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 매우 밝게 (원본 색상의 15% + 흰색 85%)
    const newR = Math.round(r * 0.15 + 255 * 0.85);
    const newG = Math.round(g * 0.15 + 255 * 0.85);
    const newB = Math.round(b * 0.15 + 255 * 0.85);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  // 아이콘 색상 (금액 버튼 색상과 다른 색상들)
  const iconColors = [
    '#FF6B9D',  // 핑크
    '#FFA07A',  // 연한 주황
    '#9B59B6',  // 보라
    '#3498DB',  // 파란색
    '#F39C12',  // 주황
    '#1ABC9C',  // 청록
    '#E74C3C',  // 빨강
    '#95A5A6'   // 회색
  ];

  // 아이콘 클릭 핸들러
  const handleIconClick = (donation, index, event) => {
    const iconElement = event.currentTarget;
    const iconRect = iconElement.getBoundingClientRect();
    const containerRect = iconElement.closest('.bg-white').getBoundingClientRect();
    
    // 아이콘의 상대적 위치 계산
    const relativeX = iconRect.left - containerRect.left + iconRect.width / 2;
    
    const color = iconColors[index % iconColors.length];
    
    setBubblePosition({
      x: relativeX,
      color: color,
      lightColor: lightenColor(color)
    });
    
    setSelectedDonation(donation);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 mx-4 relative">
      {/* 상품 이미지/링크 썸네일 */}
      <div className="p-4 bg-gray-50">
        <a 
          href={item.link?.trim() || item[' link']?.trim()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group"
        >
          {item.image ? (
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden aspect-square">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-800 font-semibold text-sm">
                  상품 링크 보기
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E6A5BD] to-[#DE1761]" />
              <div className="relative text-center text-white z-10">
                <div className="text-6xl mb-2">🎁</div>
                <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  상품 링크 보기
                </div>
              </div>
            </div>
          )}
        </a>
      </div>

      {/* 상품 정보 */}
      <div className="p-5">
        {/* 상품명 */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">{item.title}</h2>

        {/* 목표액 정보와 후원자 아이콘 (좌우 배치) */}
        <div className="flex gap-4 mb-4">
          {/* 왼쪽 60%: 목표액 정보 */}
          <div className="w-[60%] flex flex-col justify-center">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-bold text-[#381DFC]">
                {formatNumber(currAmt)}
              </span>
              <span className="text-sm text-gray-500">
                / {formatNumber(item.goal_price)} 원
              </span>
            </div>
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#381DFC] to-[#DE1761] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* 오른쪽 40%: 후원자 아이콘들 (테두리 안에 가로 슬라이드) */}
          <div className="w-[40%] flex items-center">
            {!loading && donations.length > 0 ? (
              <div className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 bg-white shadow-inner overflow-x-auto scrollbar-hide">
                <div className="flex gap-2">
                  {donations.map((donation, index) => {
                    const bgColor = iconColors[index % iconColors.length];
                    return (
                      <button
                        key={index}
                        ref={(el) => (iconRefs.current[index] = el)}
                        onClick={(e) => handleIconClick(donation, index, e)}
                        className="w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center text-white font-bold shadow-md hover:scale-110 transition-transform cursor-pointer"
                        style={{ 
                          backgroundColor: bgColor,
                          fontSize: '11px',
                          letterSpacing: '-0.5px'
                        }}
                        title={donation.donator_nm}
                      >
                        {donation.donator_nm.substring(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full text-center text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-xl py-3">
                첫 후원자가 되어주세요!
              </div>
            )}
          </div>
        </div>

        {/* 후원자 메시지 모달 */}
        {selectedDonation && (
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isMessageFading ? 'opacity-0' : 'opacity-100'}`}
            onClick={() => setSelectedDonation(null)}
          >
            <div 
              className="max-w-sm w-full rounded-2xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: bubblePosition.lightColor,
                border: `4px solid ${bubblePosition.color}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div 
                className="px-6 py-4 flex items-center justify-between"
                style={{ backgroundColor: bubblePosition.color }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg"
                    style={{ 
                      backgroundColor: bubblePosition.color,
                      border: '3px solid white',
                      fontSize: '13px',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    {selectedDonation.donator_nm.substring(0, 2)}
                  </div>
                  <p className="font-bold text-xl text-white">
                    {selectedDonation.donator_nm}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
              
              {/* 메시지 내용 */}
              <div className="px-6 py-5">
                {selectedDonation.message ? (
                  <p className="text-base leading-relaxed text-gray-800">
                    "{selectedDonation.message}"
                  </p>
                ) : (
                  <p className="text-base leading-relaxed text-gray-600 text-center">
                    후원해주셔서 감사합니다! 💝
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 후원하기 버튼들 */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onDonateClick(item, 15000)}
            className="flex-1 bg-[#65D5E8] hover:bg-[#2810d0] text-white font-semibold py-2.5 px-2 rounded-lg transition-colors text-sm"
          >
            15,000
          </button>
          <button
            onClick={() => onDonateClick(item, 20000)}
            className="flex-1 bg-[#381DFC] hover:bg-[#b91250] text-white font-semibold py-2.5 px-2 rounded-lg transition-colors text-sm"
          >
            20,000
          </button>
          <button
            onClick={() => onDonateClick(item, 25000)}
            className="flex-1 bg-[#DE1761] hover:bg-[#d98ca7] text-white font-semibold py-2.5 px-2 rounded-lg transition-colors text-sm"
          >
            25,000
          </button>
          <button
            onClick={() => onDonateClick(item, 'custom')}
            className="flex-1 bg-[#E6A5BD] hover:bg-[#4cc4da] text-white font-semibold py-2.5 px-1 rounded-lg transition-colors text-sm whitespace-nowrap"
            style={{ letterSpacing: '-0.5px' }}
          >
            직접 입력
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;

