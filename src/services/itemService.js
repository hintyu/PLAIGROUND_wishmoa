import { collection, query, where, orderBy, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 진행중인 상품 목록을 조회합니다
 */
export const getActiveItems = async () => {
  try {
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef,
      where('status', '==', '진행중')
    );
    
    const querySnapshot = await getDocs(q);
    const items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // item_id 기준으로 오름차순 정렬 (클라이언트 측)
    items.sort((a, b) => {
      const idA = a.item_id || parseInt(a.id) || 0;
      const idB = b.item_id || parseInt(b.id) || 0;
      return idA - idB;
    });
    
    return items;
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 상품의 현재 금액을 업데이트합니다
 */
export const updateItemAmount = async (itemDocId, amount) => {
  try {
    const itemRef = doc(db, 'items', itemDocId);
    await updateDoc(itemRef, {
      curr_amt: increment(amount)
    });
  } catch (error) {
    console.error('상품 금액 업데이트 실패:', error);
    throw error;
  }
};

