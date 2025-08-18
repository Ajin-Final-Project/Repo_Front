// src/config.js

// 백엔드(FastAPI) 기본 주소: .env의 REACT_APP_API_BASE 우선 사용
// 없으면 로컬 8000을 기본값으로 사용
const baseURLApi = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

// 리다이렉트 기준 URL
const redirectUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://demo.flatlogic.com/one-react';

// 백엔드 사용 플래그 (기본 true)
// REACT_APP_BACKEND가 'false'일 때만 mock 모드로 전환
const isBackend =
  (process.env.REACT_APP_BACKEND || 'true').toString().toLowerCase() === 'true';

export default {
  redirectUrl,
  baseURLApi,     // ← index.js 에서 axios.defaults.baseURL 로 사용
  isBackend,      // ← 반드시 true 여야 실제 백엔드 호출

  // 필요시 데모 계정 표시용
  auth: {
    email: 'admin@flatlogic.com',
    password: 'password',
  },

  app: {
    colors: {
      dark: "#323232",
      light: "#FFFFFF",
    },
    themeColors: {
      warning: '#FEBE69',
      danger: '#f5695a',
      success: '#3bbf97',
      info: '#12b4de'
    }
  }
};
