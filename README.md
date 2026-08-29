# 🍕 개발했슈 (Gaebalhaetsyu) 노션 위젯 플랫폼

> **개발했슈 1기 제빵사(제작자)들이 구워낸 다양하고 감성적인 노션 위젯을 구경하고 노션에 바로 담아 사용하는 플랫폼입니다.**

---

## 🌟 주요 기능

- **🍕 위젯 진열대**: 카테고리별/인기순/최신순으로 제작된 노션 위젯 탐색
- **📋 원클릭 노션 임베드**: 원하는 위젯의 임베드 링크를 복사하여 노션 페이지에 즉시 삽입
- **❤️ 관심 위젯 찜하기**: 마음에 드는 위젯을 내 작업대에 보관
- **🧑‍🍳 1기 제작자 전용 위젯 굽기(등록) & 수정**: 사전 등록된 제빵사들이 직접 위젯을 등록하고 수정할 수 있는 전용 스튜디오
- **🛠️ 관리자 대시보드**: 위젯 공개 승인/숨김 상태 관리 및 회원 권한 관리

---

## 🔐 3단계 권한 체계 (Role Architecture)

본 서비스는 **관리자(`admin`)**, **제작자(`provider`)**, **일반(`visitor`)** 3단계의 명확한 권한 모델로 동작합니다.

```mermaid
graph TD
    User([구글 로그인]) --> CheckRole{역할 판별}
    
    CheckRole -->|admin| Admin[👑 관리자 · admin]
    CheckRole -->|provider| Provider[🧑‍🍳 제작자 · provider]
    CheckRole -->|visitor| Visitor[☕ 일반 손님 · visitor]
    
    Admin --> A1[관리자 대시보드 접근]
    Admin --> A2[모든 위젯 등록 / 수정 / 공개 승인]
    Admin --> A3[모든 회원 권한 변경]
    
    Provider --> P1[새 위젯 굽기 등록]
    Provider --> P2[본인이 직접 등록한 위젯만 수정]
    Provider --> P3[마이페이지 구운 위젯 관리]
    
    Visitor --> V1[위젯 둘러보기 및 상세 확인]
    Visitor --> V2[노션 링크 복사 / 다운로드]
    Visitor --> V3[관심 위젯 찜하기 ❤️]
    Visitor --> V4[위젯 등록/수정 접근 차단]
```

### 1. 👑 관리자 (`admin`)
- 웹사이트의 **모든 관리 권한**을 보유합니다.
- 관리자 페이지(`/admin`)에 접근하여 회원들의 역할(Role: `admin`, `provider`, `visitor`)을 변경하고, 위젯의 공개/숨김 상태를 심사할 수 있습니다.
- 모든 위젯의 등록, 수정, 삭제 권한을 가집니다.

### 2. 🧑‍🍳 제작자 (`provider`)
- 새 위젯을 등록할 수 있는 권한(`새 위젯 굽기`)을 가집니다.
- **본인이 직접 등록한 위젯만 수정**할 수 있습니다.
- 마이페이지(내 작업대)에서 '내가 구운 피자' 목록 및 위젯 통계(조회수, 복사수, 찜 수)를 확인하고 관리할 수 있습니다.
- 관리자 페이지(`/admin`)에는 접근할 수 없습니다.

### 3. ☕ 일반 손님 (`visitor`)
- 구글 로그인을 진행하더라도 기본적으로 일반 손님(`visitor`) 권한이 부여됩니다.
- 위젯을 둘러보고, 상세 정보를 확인하며, **노션 임베드 링크 복사(다운로드) 및 찜하기(❤️)** 가 가능합니다.
- 위젯 등록 및 수정 권한이 없으며, 위젯 등록 페이지 접근 시 [1기 제작자 인증 페이지](/creators/join)로 유도됩니다.

---

## 🔑 1기 제작자 사전 초대 & 인증 시스템 (`cohort_invites`)

무분별한 위젯 등록을 방지하고 사전 선발된 참가자에게만 제작자(`provider`) 권한을 부여하기 위해 **3중 일치 검증 시스템**을 적용하였습니다.

### 1. Firebase Firestore `cohort_invites` 데이터베이스 구조

| 필드명 (Field) | 데이터 타입 | 설명 | 예시 값 |
| :--- | :--- | :--- | :--- |
| `email` | `string` | 참가자 구글 계정 이메일 (소문자) | `user@gmail.com` |
| `nickname` | `string` | 참가자의 사전 등록 닉네임 | `우주피자장인` |
| `code` | `string` | 참가자에게 개별 전달된 **고유 해시코드** | `dev1_8f9c2a` |
| `cohort` | `string` | 소속 기수 명칭 | `개발했슈 1기` |
| `role` | `string` | 인증 성공 시 부여할 권한 (`provider` / `admin` / `visitor`) | `provider` |
| `is_used` | `boolean` | 코드 사용 완료 여부 (중복 도용 방지) | `false` |
| `used_by` | `string` / `null` | 인증한 유저의 Firebase Auth UID | `null` |
| `used_at` | `string` / `null` | 인증 완료 일시 | `null` |

### 2. 인증 및 판별 프로세스
1. 사용자가 웹사이트에서 **구글 로그인**을 진행합니다.
2. [제작자 인증 페이지](/creators/join)에서 전달받은 **닉네임**과 **고유 해시코드**를 입력하고 제출합니다.
3. 서버(`verifyJoinCode`)에서 다음 3가지를 대조합니다:
   - **구글 로그인 이메일** 일치 여부
   - **사전 등록 닉네임** 일치 여부
   - **고유 해시코드** 일치 및 미사용(`is_used: false`) 여부
4. 모두 일치할 경우:
   - 해당 초대 코드를 `is_used = true`로 변경하여 중복 사용을 차단합니다.
   - 사용자 역할을 `cohort_invites`의 지정된 역할(기본: `provider`)로 승급합니다.
   - 1기 제작자 프로필(`creator_profiles`)을 자동 생성합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: Next.js 16 (App Router, Server Components & Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Firebase Firestore & Firebase Authentication (Google OAuth), Firebase Admin SDK
- **Deployment**: Vercel

---

## 🚀 시작하기 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정 (`.env.local`)
```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin SDK Configuration
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 4. 초기 샘플 데이터 시딩 (선택)
브라우저에서 `http://localhost:3000/api/seed` 또는 `GET /api/seed` 요청을 보내면 기본 카테고리, 샘플 위젯, 1기 사전 초대 코드가 Firestore에 자동 등록됩니다.
