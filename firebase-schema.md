# Firebase Firestore 스키마 설계

## 컬렉션 구조

### 1. items (상품 테이블)

상품 정보를 저장하는 컬렉션

```
컬렉션명: items
```

**필드:**

| 필드명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| item_id | number | 상품 ID (1부터 시작하는 숫자 PK) | ✓ |
| title | string | 상품명 | ✓ |
| link | string | 쇼핑몰 링크 URL | ✓ |
| image | string | 상품 이미지 URL | ✗ |
| goal_price | number | 목표 후원금액 (원) | ✓ |
| status | string | 상태: "진행중" \| "삭제됨" \| "달성완료" | ✓ |
| regis_datetime | string | 등록일시 (yyyymmddhhmmss 형식) | ✓ |

**참고**: `curr_amt`(현재 달성액)는 donations 테이블에서 `confirm_yn='y'`인 후원의 `amount` 합계로 실시간 계산됩니다.

**인덱스:**
- item_id (Primary Key로 사용)
- status (상태별 조회를 위한 인덱스)

**예시 데이터:**
```json
{
  "item_id": 1,
  "title": "애플 에어팟 프로 2세대",
  "link": "https://www.apple.com/kr/airpods-pro/",
  "image": "https://example.com/images/airpods-pro.jpg",
  "goal_price": 359000,
  "status": "진행중",
  "regis_datetime": "20251106143000"
}
```

---

### 2. donations (후원 테이블)

후원 정보를 저장하는 컬렉션

```
컬렉션명: donations
```

**필드:**

| 필드명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| done_id | string | 후원 ID (Firestore 자동생성 ID 사용 가능) | ✓ |
| item_id | number | 상품 ID (items의 item_id를 참조) | ✓ |
| donator_nm | string | 후원자명 | ✓ |
| message | string | 후원자가 남긴 메시지 | ✗ |
| amount | number | 후원금액 (원) | ✓ |
| regis_datetime | string | 등록일시 (yyyymmddhhmmss 형식) | ✓ |
| confirm_yn | string | 확인여부: "y" \| "n" | ✓ |

**인덱스:**
- done_id (Primary Key로 사용)
- item_id (특정 상품의 후원 내역 조회를 위한 인덱스)
- regis_datetime (시간순 정렬을 위한 인덱스)

**예시 데이터:**
```json
{
  "done_id": "DON20251106001",
  "item_id": 1,
  "donator_nm": "홍길동",
  "message": "지호야 생일 축하해!",
  "amount": 20000,
  "regis_datetime": "20251106150000",
  "confirm_yn": "y"
}
```

---

## Firestore 보안 규칙 권장사항

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // items 컬렉션: 읽기는 모두 허용, 쓰기는 인증된 사용자만
    match /items/{itemId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // donations 컬렉션: 읽기는 모두 허용, 쓰기는 모두 허용 (후원 받기 위해)
    match /donations/{donationId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

---

## 데이터 관계

```
items (1) ←─────── (*) donations
  └── item_id           └── item_id (FK)
```

- 하나의 상품(items)은 여러 개의 후원(donations)을 받을 수 있습니다.
- donations의 item_id는 items의 item_id를 참조합니다.

---

## 주요 쿼리 패턴

### 1. 진행중인 상품 목록 조회
```javascript
db.collection('items')
  .where('status', '==', '진행중')
  .orderBy('regis_datetime', 'desc')
  .get()
```

### 2. 특정 상품의 후원 내역 조회
```javascript
db.collection('donations')
  .where('item_id', '==', itemId)
  .where('confirm_yn', '==', 'y')
  .orderBy('regis_datetime', 'desc')
  .get()
```

### 3. 후원 정보 저장
```javascript
// 후원 정보만 저장 (curr_amt는 실시간 계산)
const donationRef = db.collection('donations').doc();
await donationRef.set(donationData);

// 현재 달성액은 다음과 같이 조회:
const donationsSnapshot = await db.collection('donations')
  .where('item_id', '==', itemId)
  .where('confirm_yn', '==', 'y')
  .get();

const currAmt = donationsSnapshot.docs.reduce((sum, doc) => 
  sum + (doc.data().amount || 0), 0
);
```


