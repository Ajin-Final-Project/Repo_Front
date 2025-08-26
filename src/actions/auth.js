import axios from 'axios';
import config from '../config';
import jwt from "jsonwebtoken";
import { toast } from 'react-toastify';
import { push } from 'connected-react-router';
import Errors from "../components/FormItems/error/errors";
import { mockUser } from "./mock";

export const AUTH_FAILURE = 'AUTH_FAILURE';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const RESET_REQUEST = 'RESET_REQUEST';
export const RESET_SUCCESS = 'RESET_SUCCESS';
export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

const API_BASE = process.env.REACT_APP_API_BASE;

async function findMe() {
  if (config.isBackend) {
    const response = await axios.get(`${API_BASE}/auth/me`);
    return response.data;
  } else {
    return mockUser;
  }
}

export function authError(payload) {
  return { type: AUTH_FAILURE, payload };
}

function requestLogin() { return { type: LOGIN_REQUEST }; }
export function receiveLogin() { return { type: LOGIN_SUCCESS }; }
function requestLogout() { return { type: LOGOUT_REQUEST }; }
function loginError(payload) { return { type: LOGIN_FAILURE, payload }; }

export function doInit() {
  return async (dispatch) => {
    let currentUser = null;

    if (!config.isBackend) {
      currentUser = mockUser;
      dispatch({ type: AUTH_INIT_SUCCESS, payload: { currentUser } });
    } else {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // ✅ 토큰이 있으면 헤더를 복구하고 /auth/me 호출
          axios.defaults.headers.common['Authorization'] = "Bearer " + token;
          currentUser = await findMe();
        }
        dispatch({ type: AUTH_INIT_SUCCESS, payload: { currentUser } });
      } catch (error) {
        const code = error?.response?.status;
        if (code === 401 || code === 404) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        } else {
          Errors.handle(error);
        }
        dispatch({ type: AUTH_INIT_ERROR, payload: error });
      }
    }
  }
}

export function receiveLogout() {
  return { type: LOGOUT_SUCCESS };
}

export function logoutUser() {
  return (dispatch) => {
    dispatch(requestLogout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    dispatch(receiveLogout());
    dispatch(push('/login'));
  };
}

export function receiveToken(token) {
  return (dispatch) => {
    let user;

    if (config.isBackend) {
      try { user = jwt.decode(token); } catch { user = {}; }
    } else {
      user = {
        email: config.auth.email,
        user: { id: 'default_no_connection_id_444' }
      };
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = "Bearer " + token;
    dispatch(receiveLogin());
    dispatch(push('/app/dashboard/analytics'));
  }
}

export function loginUser(creds) {
  return (dispatch) => {
    if (!config.isBackend) {
      dispatch(receiveToken('token'));
      dispatch(doInit());
      dispatch(push('/app'));
    } else {
      dispatch(requestLogin());
      if (creds.social) {
        window.location.href =
          API_BASE + "/auth/signin/" + creds.social + '?app=' + config.redirectUrl;
      } else if (creds.email?.length > 0 && creds.password?.length > 0) {
        axios.post(`${API_BASE}/auth/login`, creds)
          .then(({ data }) => {
            const token = data?.token || data; // {token, user} 또는 문자열 대응
            dispatch(receiveToken(token));
            dispatch(doInit());
            dispatch(push('/app'));
          })
          .catch(err => {
            const msg =
              err?.response?.data?.detail ||
              err?.response?.data?.message ||
              (typeof err?.response?.data === 'string' ? err.response.data : null) ||
              err?.message ||
              '로그인에 실패했습니다.';
            dispatch(loginError(msg));
          });
      } else {
        dispatch(authError('아이디와 비밀번호를 입력하세요.'));
      }
    }
  };
}

export function resetPassword(token, password) {
  return (dispatch) => {
    if (!config.isBackend) {
      dispatch(push('/login'));
    } else {
      dispatch({ type: RESET_REQUEST });
      axios.put(`${API_BASE}/auth/password-reset`, { token, password })
        .then(() => {
          dispatch({ type: RESET_SUCCESS });
          toast.success("Password has been updated");
          dispatch(push('/login'));
        })
        .catch(err => {
          dispatch(authError(err.response?.data));
        })
    }
  }
}

export function sendPasswordResetEmail(email) {
  return (dispatch) => {
    if (!config.isBackend) {
      dispatch(push('/login'));
    } else {
      dispatch({ type: PASSWORD_RESET_EMAIL_REQUEST });
      axios.post(`${API_BASE}/auth/send-password-reset-email`, { email })
        .then(() => {
          dispatch({ type: PASSWORD_RESET_EMAIL_SUCCESS });
          toast.success("Email with resetting instructions has been sent");
          dispatch(push('/login'));
        })
        .catch(err => {
          dispatch(authError(err.response?.data));
        })
    }
  }
}

export function registerUser(creds) {
  return (dispatch) => {
    if (!config.isBackend) {
      dispatch(push('user/profile'));
    } else {
      dispatch({ type: REGISTER_REQUEST });
      if (creds.email?.length > 0 && creds.password?.length > 0) {
        axios.get(`${API_BASE}/auth/singup`, creds)
          .then(() => {
            dispatch({ type: REGISTER_SUCCESS });
            toast.success("You've been registered successfully. Please check your email for verification link");
            dispatch(push('/user/profile'));
          })
          .catch(err => {
            dispatch(authError(err.response?.data));
          })
      } else {
        dispatch(authError('Something was wrong. Try again.'));
      }
    }
  };
}
