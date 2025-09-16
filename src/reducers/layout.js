// reducers/layout.js
import {
  CHANGE_THEME,
  CHANGE_THEME_COLOR,
  CHANGE_SIDEBAR_COLOR,
  CHANGE_NAVBAR_COLOR,
  NAVBAR_TYPE_TOGGLE,
  SIDEBAR_TYPE_TOGGLE,
} from "../actions/layout";

import config from "../config";

// 테마 팔레트(키)와 직접색(HEX) 혼용을 지원하기 위한 상수
export const DashboardThemes = {
  LIGHT: "light",
  DARK: "dark",
  WARNING: "#FEB049", // #FEBE69
  DANGER: "#F5695A",
  SUCCESS: "#3BBF97",
  INFO: "#12B4DE",
};

export const SidebarTypes = {
  SOLID: "solid",
  TRANSPARENT: "transparent",
};

export const NavbarTypes = {
  STATIC: "static",
  FLOATING: "floating",
};

export const LayoutComponents = {
  NAVBAR: "navbar",
  SIDEBAR: "sidebar",
};

Object.freeze(DashboardThemes);
Object.freeze(SidebarTypes);
Object.freeze(NavbarTypes);
Object.freeze(LayoutComponents);

// 스토어에는 키워드("warning") 또는 HEX("#FEBE69") 둘 중 하나가 들어올 수 있음
const defaultState = {
  dashboardTheme: DashboardThemes.LIGHT,
  sidebarColor: DashboardThemes.LIGHT,
  navbarColor: config.app.colors.dark,
  navbarType: NavbarTypes.STATIC,
  sidebarType: SidebarTypes.SOLID,
  // 👉 키워드로 시작(팔레트 키를 선호할 경우). 바로 HEX로 시작해도 무방.
  themeColor: "warning",
};

// 안전용 유틸
const isHex = (v) =>
  typeof v === "string" &&
  /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(v.trim());

// 키워드 → HEX 매핑 (팔레트 키를 쓰는 컴포넌트를 위해 공통 변환)
export const COLOR_MAP = {
  light: "#ffffff",
  dark: "#222222",
  warning: DashboardThemes.WARNING, // "#FEBE69"
  danger: DashboardThemes.DANGER,   // "#F5695A"
  success: DashboardThemes.SUCCESS, // "#3BBF97"
  info: DashboardThemes.INFO,       // "#12B4DE"
};

// 셀렉터: MUI/HTML(예: css var, charts)에서 바로 쓸 HEX 반환
export const selectThemeHex = (state) => {
  const raw = state?.layout?.themeColor ?? "";
  const v = String(raw).trim();
  if (isHex(v)) return v; // 이미 HEX면 그대로
  const key = v.toLowerCase();
  return COLOR_MAP[key] || v; // 키워드면 매핑, 아니면 원본(최소한의 관용성)
};

// (옵션) 현재 키워드를 알고 싶을 때—HEX가 들어있다면 null 반환
export const selectThemeKey = (state) => {
  const raw = state?.layout?.themeColor ?? "";
  const v = String(raw).trim();
  if (isHex(v)) return null;
  const key = v.toLowerCase();
  return COLOR_MAP[key] ? key : null;
};

export default function layoutReducer(state = defaultState, action) {
  switch (action.type) {
    case CHANGE_THEME:
      return {
        ...state,
        dashboardTheme: action.payload,
      };

    case CHANGE_THEME_COLOR: {
      // 키워드/HEX 모두 허용. 문자열이면 소문자 정규화(키워드 일관성).
      const next = typeof action.payload === "string"
        ? action.payload.trim()
        : action.payload;
      return {
        ...state,
        themeColor:
          typeof next === "string" && !isHex(next) ? next.toLowerCase() : next,
      };
    }

    case CHANGE_SIDEBAR_COLOR:
      return {
        ...state,
        sidebarColor: action.payload,
      };

    case CHANGE_NAVBAR_COLOR:
      return {
        ...state,
        navbarColor: action.payload,
      };

    case NAVBAR_TYPE_TOGGLE:
      return {
        ...state,
        navbarType: action.payload,
      };

    case SIDEBAR_TYPE_TOGGLE:
      return {
        ...state,
        sidebarType: action.payload,
      };

    default:
      return state;
  }
}
