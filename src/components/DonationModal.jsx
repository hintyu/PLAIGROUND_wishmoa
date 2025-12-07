import { useState } from 'react';
import { createDonation } from '../services/donationService';

const DonationModal = ({ isOpen, onClose, item, amount, onDonationSuccess }) => {
  const [donatorName, setDonatorName] = useState('');
  const [message, setMessage] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 직접입력인 경우와 아닌 경우 처리
  const isCustomAmount = amount === 'custom';
  const finalAmount = isCustomAmount ? parseInt(customAmount) || 0 : amount;

  // 계좌번호 (환경변수 또는 기본값)
  const ACCOUNT_NUMBER = import.meta.env.VITE_ACCOUNT_NUMBER || '110-509-713407 신한은행';

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(ACCOUNT_NUMBER)
      .then(() => {
        alert('계좌번호가 복사되었습니다!');
      })
      .catch(() => {
        alert('복사에 실패했습니다. 다시 시도해주세요.');
      });
  };

  const handleTossLink = () => {
    // 토스 딥링크 - 실제 계좌 정보와 선물 금액 적용
    const tossUrl = `supertoss://send?amount=${finalAmount}&bank=%EC%8B%A0%ED%95%9C%EC%9D%80%ED%96%89&accountNo=110509713407&origin=qr`;
    window.location.href = tossUrl;
    
    // 딥링크가 작동하지 않을 경우 토스 앱스토어로 이동
    setTimeout(() => {
      window.open('https://toss.im/', '_blank');
    }, 1500);
  };

  const handleSubmit = async (buttonType) => {
    // 유효성 검사
    if (!donatorName.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }

    if (isCustomAmount && (!customAmount || finalAmount <= 0)) {
      alert('선물 금액을 올바르게 입력해주세요!');
      return;
    }

    // item 확인
    if (!item || !item.id) {
      console.error('Item data:', item);
      alert('상품 정보가 올바르지 않습니다. 페이지를 새로고침 해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // item_id는 item.item_id가 있으면 사용, 없으면 Firestore 문서 ID 사용
      const itemId = item.item_id || item.id;
      
      // 선물 데이터 생성
      const donationData = {
        item_id: itemId,
        donator_nm: donatorName.trim(),
        message: message.trim(),
        amount: finalAmount
      };

      console.log('선물 데이터:', donationData);
      console.log('상품 문서 ID:', item.id);

      // Firebase에 저장
      await createDonation(item.id, donationData);

      // 성공 알림
      alert(`선물해주셔서 감사합니다! 잘 쓸게요💝`);

      // 버튼 타입에 따라 동작
      if (buttonType === 'copy') {
        handleCopyAccount();
      } else if (buttonType === 'toss') {
        handleTossLink();
      }

      // 모달 닫기 및 데이터 새로고침
      onDonationSuccess();
      onClose();
      
      // 폼 초기화
      setDonatorName('');
      setMessage('');
      setCustomAmount('');
    } catch (error) {
      console.error('선물 처리 실패:', error);
      alert('선물 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#381DFC] to-[#DE1761] text-white p-4 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold mb-1">{item?.title}</h3>
              <p className="text-base">
                {isCustomAmount ? (
                  <span>선물합니다! 💝</span>
                ) : (
                  <span>{formatNumber(amount)}원 어치 선물합니다! 💝</span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white text-2xl font-bold hover:text-gray-200"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-4">
          {/* 직접입력 금액 */}
          {isCustomAmount && (
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                선물 금액 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="금액을 입력하세요"
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#381DFC]"
                disabled={isSubmitting}
              />
              {customAmount && (
                <p className="mt-1.5 text-sm text-[#381DFC] font-semibold">
                  {formatNumber(finalAmount)}원
                </p>
              )}
            </div>
          )}

          {/* 이름 입력 */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={donatorName}
              onChange={(e) => setDonatorName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
              disabled={isSubmitting}
            />
          </div>

          {/* 메시지 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              메시지 (선택)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="따뜻한 메시지를 남겨주세요"
              rows={2}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼들 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSubmit('copy')}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리중...' : '계좌번호 복사'}
            </button>
            <button
              onClick={() => handleSubmit('toss')}
              className="bg-gradient-to-r from-[#381DFC] to-[#DE1761] hover:from-[#2810d0] hover:to-[#b91250] text-white font-semibold py-3 px-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed leading-tight"
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리중...' : <>토스로 바로<br/>쏴줄게!</>}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            버튼을 누르면 선물 정보가 저장됩니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;

