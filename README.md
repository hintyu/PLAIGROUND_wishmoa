# 🎁 지호에게 선물주기

더이상 치킨 기프티콘, 디퓨저는 그만! 나도 이제 큰 선물을 원한다!

후원하는 사이트를 본따 만든 선물 후원 사이트입니다. 모바일 UI 전용으로 제작되었습니다.

---

## 🚀 GitHub 배포 준비 완료

이 프로젝트는 민감정보를 제외하고 안전하게 GitHub에 배포할 수 있도록 구성되었습니다.

### ⚠️ 배포 전 확인사항

**로컬에 `.env` 파일을 생성하고 다음 정보를 입력하세요:**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Account Information (Optional)
VITE_ACCOUNT_NUMBER=your_account_number
```

---

## 🛠 기술 스택

- **Frontend**: React 18, Tailwind CSS, JavaScript
- **Backend**: Firebase Firestore
- **Build Tool**: Vite
- **Hosting**: Firebase Hosting
- **Custom Font**: Omyu Pretty

---

## 📋 주요 기능

1. **상품 목록 조회**: 진행중인 선물 목록을 카드 형태로 표시 (item_id 순)
2. **실시간 후원 현황**: donations 테이블 합계로 실시간 계산
3. **후원자 표시**: 후원한 사람들을 컬러풀한 동그라미 아이콘으로 표시 (가로 스크롤)
4. **후원자 메시지**: 아이콘 클릭 시 모달로 메시지 확인
5. **간편 후원**: 정액 버튼(15,000 / 20,000 / 25,000) 또는 직접입력
6. **계좌 복사 & 토스 연동**: 계좌번호 복사 또는 토스 딥링크로 바로 송금
7. **상품 이미지**: 폴라로이드 스타일 썸네일로 표시

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd givemegift
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env` 파일을 생성하고 Firebase 설정 정보를 입력하세요. (`.env.example` 참고)

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 🔥 Firebase 설정

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. Firestore Database 활성화 (테스트 모드)
4. 위치: `asia-northeast3 (서울)` 권장

### 2. Firestore 보안 규칙 설정

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // items 컬렉션
    match /items/{itemId} {
      allow read: if true;
      allow update: if true;  // curr_amt 업데이트용
      allow create, delete: if request.auth != null;
    }
    
    // donations 컬렉션
    match /donations/{donationId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

### 3. items 컬렉션 데이터 추가

Firebase Console에서 `items` 컬렉션에 상품 데이터를 추가하세요:

```json
{
  "item_id": 1,
  "title": "상품명",
  "link": "https://쇼핑몰주소",
  "image": "https://이미지URL",
  "goal_price": 359000,
  "status": "진행중",
  "regis_datetime": "20251106000000"
}
```

**주의**: `curr_amt` 필드는 **불필요**합니다. donations 합계로 자동 계산됩니다.

---

## 📊 데이터베이스 구조

자세한 스키마는 `firebase-schema.md` 참조

### items (상품)
- `item_id`: 숫자 ID
- `title`: 상품명
- `link`: 쇼핑몰 링크
- `image`: 상품 이미지 URL
- `goal_price`: 목표 금액
- `status`: "진행중" | "삭제됨" | "달성완료"
- `regis_datetime`: yyyymmddhhmmss

### donations (후원)
- `done_id`: 후원 ID (자동생성)
- `item_id`: 상품 ID (FK)
- `donator_nm`: 후원자명
- `message`: 메시지
- `amount`: 후원금액
- `regis_datetime`: yyyymmddhhmmss
- `confirm_yn`: "y" | "n" (입금 확인 여부)

**참고**: `confirm_yn='n'`으로 변경하면 해당 후원은 표시되지 않습니다.

---

## 🎨 디자인 특징

- **컬러 테마**: 파란색(#381DFC), 핑크(#DE1761), 연핑크(#E6A5BD), 청록(#65D5E8), 노랑(#F3F33B)
- **커스텀 폰트**: Omyu Pretty
- **모바일 최적화**: 터치 친화적 UI
- **애니메이션**: 부드러운 전환 효과

---

## 🔥 Firebase 배포

### 1. Firebase CLI 설치 및 로그인

```bash
npm install -g firebase-tools
firebase login
```

### 2. 프로젝트 초기화

```bash
firebase init hosting
```

설정:
- Public directory: `dist`
- Single-page app: `Yes`
- Overwrite index.html: `No`

### 3. 빌드 및 배포

```bash
npm run build
firebase deploy
```

---

## 📝 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드 결과 미리보기

---

## 💡 사용 팁

1. **후원 테스트**: 개발자 도구 모바일 모드로 테스트
2. **토스 딥링크**: 실제 모바일 기기에서만 작동
3. **후원 취소**: Firebase Console에서 `confirm_yn`을 `'n'`으로 변경
4. **상품 정렬**: `item_id` 오름차순 자동 정렬

---

## 📄 라이센스

이 프로젝트는 개인 프로젝트입니다.

---

Made with 💙 for Jiho
