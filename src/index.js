import React from 'react';
import ReactDOM from 'react-dom/client';
import { routerMiddleware } from "connected-react-router";
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';

import App from './components/App';
import config from './config';
import createRootReducer from './reducers';

import { doInit } from "./actions/auth";
import { createHashHistory } from "history";

import 'bootstrap/dist/css/bootstrap.min.css';


import LoadingScreen from './lib/loadingScreen';

const history = createHashHistory();

export function getHistory() {
  return history;
}


LoadingScreen.init({
  backgroundColor: 'rgba(0,0,0,0.6)',
  svgColor: '#ffffff',
  svgSize: '72px',
});

// 백엔드 베이스 URL/헤더 설정
axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common['Content-Type'] = "application/json";
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = "Bearer " + token;
}

// ⬅ 추가: axios 전역 인터셉터 (모든 API 요청에 로딩 자동 적용)
axios.interceptors.request.use(
  (config) => {
    // X-Skip-Loading 헤더가 있으면 전역 로딩 스크린 표시하지 않음
    if (!config.headers['X-Skip-Loading']) {
      LoadingScreen.trackStart('처리 중...', 'dots'); // circle | dots | pulse | hourglass | arrows | standard
    }
    return config;
  },
  (error) => {
    LoadingScreen.trackEnd();
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    // X-Skip-Loading 헤더가 있으면 전역 로딩 스크린 종료하지 않음
    if (!response.config.headers['X-Skip-Loading']) {
      LoadingScreen.trackEnd();
    }
    return response;
  },
  (error) => {
    // X-Skip-Loading 헤더가 있으면 전역 로딩 스크린 종료하지 않음
    if (!error.config?.headers['X-Skip-Loading']) {
      LoadingScreen.trackEnd();
    }
    return Promise.reject(error);
  }
);

// ⬅ 추가: 해시 히스토리 라우팅 전환 감지 (페이지 이동 시 로딩)
history.listen(() => {
  // 전환 시작
  LoadingScreen.trackStart('페이지 이동 중...', 'dots'); // circle | dots | pulse | hourglass | arrows | standard
  // 새 화면이 그려질 시간을 조금 준 후 종료
  setTimeout(() => LoadingScreen.trackEnd(), 350);
});

export const store = createStore(
  createRootReducer(history),
  compose(
    applyMiddleware(
      routerMiddleware(history),
      ReduxThunk
    ),
  )
);

store.dispatch(doInit());

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
