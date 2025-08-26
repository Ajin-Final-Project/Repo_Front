import {
  TOGGLE_SIDEBAR,
  OPEN_SIDEBAR,
  CLOSE_SIDEBAR,
  CHANGE_ACTIVE_SIDEBAR_ITEM,
} from '../actions/navigation';

const initialState = {
  sidebarOpened: false, // 기본: 닫힘 시작 (원하면 true로)
  sidebarStatic: false, // 기본: 고정모드 아님
  activeItem: window.location.pathname,
};

export default function runtime(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return {
        // [기존설정] - 사이드바 항상 open
        // ...state,
        // sidebarOpened: !state.sidebarOpened,

        // [수정된 설정] - 고정 모드 켜질 땐 펼쳐둠, 꺼질 땐 기존 opened 유지
        ...state,
        sidebarStatic: !state.sidebarStatic,
        sidebarOpened: !state.sidebarStatic ? true : state.sidebarOpened,
      };
    case OPEN_SIDEBAR:
      return Object.assign({}, state, {
        sidebarOpened: true,
      });
    case CLOSE_SIDEBAR:
      return Object.assign({}, state, {
        sidebarOpened: false,
      });
    case CHANGE_ACTIVE_SIDEBAR_ITEM:
      return {
        ...state,
        activeItem: action.activeItem,
      };
    default:
      return state;
  }
}
