# AJIN-FACTORY-FRONT 프로젝트 문서

## 프로젝트 개요

이 프로젝트는 공장 생산 관리 시스템의 프론트엔드 애플리케이션입니다. React와 Redux를 기반으로 구축되었으며, 다양한 생산 관련 시스템들을 통합 관리할 수 있습니다.

## 주요 메뉴 시스템

### 1. 생산관리 시스템 (`/app/production`)

- **기능**: 생산 현황 모니터링 및 데이터 관리
- **주요 컴포넌트**:
  - 생산 데이터 차트: 생산 현황을 시각화
  - 생산 데이터 그리드: 생산 데이터를 테이블 형태로 관리
- **파일 위치**: `src/pages/production/ProductionManagement.js`

### 2. 금형세척 시스템 (`/app/mold`)

- **기능**: 금형세척 현황 관리 및 데이터 분석
- **주요 컴포넌트**:
  - 금형세척 차트: 세척 현황을 시각화
  - 금형세척 데이터: 세척 데이터를 테이블 형태로 관리
- **파일 위치**: `src/pages/mold/MoldCleaning.js`

### 3. 불량공정 시스템 (`/app/defect`)

- **기능**: 불량공정 현황 분석 및 관리
- **주요 컴포넌트**:
  - 불량공정 차트: 불량 현황을 시각화
  - 불량공정 그리드: 불량 데이터를 그리드 형태로 관리
- **파일 위치**: `src/pages/defect/DefectProcess.js`

### 4. 비가동 통계 시스템 (`/app/downtime`)

- **기능**: 비가동 시간 통계 및 분석
- **주요 컴포넌트**:
  - 비가동 데이터 차트: 비가동 현황을 시각화
  - 비가동 데이터: 비가동 데이터를 테이블 형태로 관리
- **파일 위치**: `src/pages/downtime/DowntimeStatistics.js`

### 5. 초/중/종품 검사 시스템 (`/app/inspection`)

- **기능**: 품질 검사 데이터 관리 및 분석
- **주요 컴포넌트**:
  - 데이터 차트: 검사 현황을 시각화
  - 초/중/종품 데이터: 검사 데이터를 테이블 형태로 관리
- **파일 위치**: `src/pages/inspection/InspectionSystem.js`

### 6. 관리자 시스템 (`/admin/users`)

- **기능**: 시스템 전반적인 관리 및 설정
- **주요 컴포넌트**:
  - 회사/공장/공정 데이터 관리
  - 공정코드 데이터 관리
  - 품목 데이터 관리
  - 사원 관리 데이터
- **파일 위치**: `src/components/Users/`

## 프로젝트 구조

### 핵심 파일들

#### 1. App.js (`src/components/App.js`)

- **역할**: 애플리케이션의 메인 진입점
- **기능**:
  - 라우팅 설정
  - 인증 상태 관리
  - 전역 컴포넌트 렌더링
- **주요 라우트**:
  - `/app/*`: 사용자 인증이 필요한 메인 애플리케이션
  - `/admin/*`: 관리자 전용 기능
  - `/login`, `/register`, `/forgot`: 인증 관련 페이지

#### 2. Layout.js (`src/components/Layout/Layout.js`)

- **역할**: 메인 레이아웃 컴포넌트
- **기능**:
  - 사이드바 및 헤더 렌더링
  - 페이지별 라우팅 처리
  - 반응형 레이아웃 관리
- **주요 라우트**:
  - `/app/production`: 생산관리 시스템
  - `/app/mold`: 금형세척 시스템
  - `/app/defect`: 불량공정 시스템
  - `/app/downtime`: 비가동 통계 시스템
  - `/app/inspection`: 초/중/종품 검사 시스템

#### 3. Sidebar.js (`src/components/Sidebar/Sidebar.js`)

- **역할**: 네비게이션 사이드바
- **기능**:
  - 메뉴 구조 정의
  - 테마별 아이콘 관리
  - 활성 메뉴 상태 관리
- **메뉴 구조**:
  - Dashboard: 대시보드 및 방문자 통계
  - 생산관리 시스템: 생산 데이터 관리
  - 금형세척시스템: 금형세척 현황
  - 불량공정시스템: 불량공정 분석
  - 비가동통계시스템: 비가동 시간 통계
  - 초/중/종품 검사 시스템: 품질 검사 관리
  - 관리자 시스템: 시스템 관리 기능

### 디렉토리 구조

```
src/
├── components/           # 재사용 가능한 컴포넌트들
│   ├── App.js          # 메인 애플리케이션 컴포넌트
│   ├── Layout/         # 레이아웃 관련 컴포넌트
│   ├── Sidebar/        # 사이드바 네비게이션
│   ├── Header/         # 헤더 컴포넌트
│   └── Users/          # 사용자 관리 컴포넌트
├── pages/              # 페이지별 컴포넌트
│   ├── production/     # 생산관리 시스템
│   ├── mold/          # 금형세척 시스템
│   ├── defect/        # 불량공정 시스템
│   ├── downtime/      # 비가동 통계 시스템
│   ├── inspection/    # 초/중/종품 검사 시스템
│   ├── dashboard/     # 대시보드
│   └── auth/          # 인증 관련 페이지
├── actions/            # Redux 액션
├── reducers/           # Redux 리듀서
├── styles/             # 전역 스타일
└── images/             # 이미지 리소스
```

## 기술 스택

### Frontend

- **React**: 사용자 인터페이스 구축
- **Redux**: 상태 관리
- **React Router**: 클라이언트 사이드 라우팅
- **SCSS**: 스타일링

### 주요 라이브러리

- **react-toastify**: 알림 시스템
- **rc-hammerjs**: 터치 제스처 지원
- **react-transition-group**: 애니메이션 효과

## 인증 시스템

### 로그인 프로세스

1. 사용자가 `/login` 페이지에서 인증 정보 입력
2. 인증 성공 시 JWT 토큰을 localStorage에 저장
3. 인증된 사용자는 `/app/*` 경로에 접근 가능
4. 관리자는 `/admin/*` 경로에 추가 접근 권한

## 테마 시스템

### 색상 테마

- **Warning (Yellow)**: 기본 테마
- **Danger (Red)**: 위험/경고 테마
- **Success (Green)**: 성공/완료 테마
- **Info (Blue)**: 정보 테마

### 사이드바 타입

- **Light**: 밝은 테마
- **Dark**: 어두운 테마
- **Transparent**: 투명 테마

## 개발 가이드

### 새 페이지 추가

1. `src/pages/` 디렉토리에 새 폴더 생성
2. 페이지 컴포넌트 및 스타일 파일 생성
3. `Layout.js`에 라우트 추가
4. `Sidebar.js`에 메뉴 항목 추가

### 새 컴포넌트 추가

1. `src/components/` 디렉토리에 새 폴더 생성
2. 컴포넌트 파일 및 스타일 파일 생성
3. 필요한 경우 package.json 파일 추가

### 스타일링

- CSS Modules 사용
- SCSS 문법 지원
- 테마별 색상 변수 활용

## 배포

### 개발 서버

```bash
npm start
```

### 테스트

```bash
npm test
```
