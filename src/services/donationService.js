import { collection, query, where, orderBy, getDocs, addDoc, writeBatch, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 특정 상품의 후원 내역을 조회합니다
 */
export const getDonationsByItem = async (itemId) => {
  try {
    const donationsRef = collection(db, 'donations');
    const q = query(
      donationsRef,
      where('item_id', '==', itemId),
      where('confirm_yn', '==', 'y'),
      orderBy('regis_datetime', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const donations = [];
    
    querySnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return donations;
  } catch (error) {
    console.error('후원 내역 조회 실패:', error);
    throw error;
  }
};

/**
 * 새로운 후원을 생성합니다 (curr_amt는 donations 합계로 실시간 계산)
 */
export const createDonation = async (itemDocId, donationData) => {
  try {
    const donationRef = doc(collection(db, 'donations'));
    const now = new Date();
    const regis_datetime = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    
    await addDoc(collection(db, 'donations'), {
      ...donationData,
      regis_datetime,
      confirm_yn: 'y'
    });
    
    return { success: true };
  } catch (error) {
    console.error('후원 생성 실패:', error);
    throw error;
  }
};

