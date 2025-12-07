import { useState, useEffect } from 'react';
import ItemCard from './components/ItemCard';
import DonationModal from './components/DonationModal';
import { getActiveItems } from './services/itemService';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const itemList = await getActiveItems();
      setItems(itemList);
    } catch (err) {
      console.error('상품 목록 로딩 실패:', err);
      setError('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDonateClick = (item, amount) => {
    setSelectedItem(item);
    setSelectedAmount(amount);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setSelectedAmount(0);
  };

  const handleDonationSuccess = () => {
    // 후원 성공 시 상품 목록 새로고침
    loadItems();
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-[#381DFC] via-[#5B3FFF] to-[#7B5FFF] text-white py-8 px-4 shadow-2xl sticky top-0 z-40 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-2xl mx-auto relative">
          <h1 className="text-3xl font-bold text-center mb-2" style={{
            textShadow: '0 2px 10px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2)',
            letterSpacing: '-0.5px'
          }}>
            지호에게 선물주기 🎁
          </h1>
          <p className="text-center text-base opacity-95" style={{
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}>
            치킨도 좋지만🍗 좀 더 특별한 선물은 어때!
          </p>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-2xl mx-auto py-6">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#381DFC] mx-auto mb-4"></div>
              <p className="text-gray-600">로딩중...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">오류 발생</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={loadItems}
              className="mt-2 text-sm underline hover:no-underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mx-4 text-center py-20">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-gray-600">아직 등록된 선물이 없습니다.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onDonateClick={handleDonateClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-6 px-4 mt-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm">Made with 💙</p>
          <p className="text-xs text-gray-400 mt-2">
            선물해주셔서 감사합니다!
          </p>
        </div>
      </footer>

      {/* 후원 모달 */}
      <DonationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
        amount={selectedAmount}
        onDonationSuccess={handleDonationSuccess}
      />
    </div>
  );
}

export default App;

