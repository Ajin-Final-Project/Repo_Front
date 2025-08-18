import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,          // ⬅ 추가
  LOGOUT_SUCCESS,
  AUTH_INIT_ERROR,
  AUTH_INIT_SUCCESS,
  PASSWORD_RESET_EMAIL_REQUEST,
  PASSWORD_RESET_EMAIL_SUCCESS,
  RESET_REQUEST,
  RESET_SUCCESS,
  AUTH_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
} from '../actions/auth';

const initialState = {
  isFetching: false,
  isAuthenticated: !!localStorage.getItem('token'), // 처음 로드 시 토큰 기준
  errorMessage: '',
  currentUser: null,
  loadingInit: true,
};

export default function auth(state = initialState, { type, payload }) {
  switch (type) {
    case LOGIN_REQUEST:
    case RESET_REQUEST:
    case PASSWORD_RESET_EMAIL_REQUEST:
    case REGISTER_REQUEST:
      return {
        ...state,
        isFetching: true,
        errorMessage: '',
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: true,   // ⬅ 로그인 성공 시 true
        errorMessage: '',
      };

    case LOGOUT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: false,  // ⬅ 로그아웃 시 false
        currentUser: null,       // ⬅ 사용자 정보도 정리
        errorMessage: '',
      };

    case RESET_SUCCESS:
    case PASSWORD_RESET_EMAIL_SUCCESS:
    case REGISTER_SUCCESS:
      return {
        ...state,
        isFetching: false,
        errorMessage: '',
      };

    case AUTH_INIT_SUCCESS:
      return {
        ...state,
        currentUser: payload?.currentUser || null,
        // init 결과에 맞춰 갱신 (토큰이 남아있으면 true)
        isAuthenticated: !!payload?.currentUser || !!localStorage.getItem('token'),
        loadingInit: false,
      };

    case AUTH_INIT_ERROR:
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
        loadingInit: false,
      };

    case LOGIN_FAILURE:          // ⬅ 추가
    case AUTH_FAILURE:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: false,
        errorMessage:
          typeof payload === 'string'
            ? payload
            : (payload?.detail || 'Authentication error'),
      };

    default:
      return state;
  }
}
