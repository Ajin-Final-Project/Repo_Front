import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import {
  Navbar,
  Nav,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  InputGroupAddon,
  InputGroup,
  Input,
  Form,
  NavItem,
  NavLink,
} from "reactstrap";
import cx from "classnames";
import { NavbarTypes } from "../../reducers/layout";
import Notifications from "../Notifications";
import { logoutUser } from "../../actions/auth";
import chroma from "chroma-js";
import {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  changeActiveSidebarItem,
} from "../../actions/navigation";

import userAvatar from "../../images/userAvatar.jpg";
import arrowActive from '../../images/Arrow 6.svg'
import arrowUnactive from '../../images/Arrow 5.svg'


import s from "./Header.module.scss";

class Header extends React.Component {
  static propTypes = {
    sidebarOpened: PropTypes.bool.isRequired,
    sidebarStatic: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.toggleMenu = this.toggleMenu.bind(this);
    this.switchSidebar = this.switchSidebar.bind(this);
    this.toggleNotifications = this.toggleNotifications.bind(this);
    this.toggleMessages = this.toggleMessages.bind(this);
    this.toggleAccount = this.toggleAccount.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.doLogout = this.doLogout.bind(this);
    this.changeArrowImg = this.changeArrowImg.bind(this);
    this.changeArrowImgOut = this.changeArrowImgOut.bind(this);

    this.state = {
      menuOpen: false,
      notificationsOpen: false,
      messagesOpen: false,
      accountOpen: false,
      notificationsTabSelected: 1,
      focus: false,
      showNewMessage: false,
      hideMessage: true,
      run: false,
      arrowImg: arrowUnactive
    };
  }

  componentDidMount() {
    if (window.location.href.includes('main')){
      this.setState({run: true})
    }
  }

  toggleFocus = () => {
    this.setState({ focus: !this.state.focus });
  };

  toggleNotifications() {
    this.setState({
      notificationsOpen: !this.state.notificationsOpen,
    });
  }

  toggleMessages() {
    this.setState({
      messagesOpen: !this.state.messagesOpen,
    });
  }

  toggleAccount() {
    this.setState({
      accountOpen: !this.state.accountOpen,
    });
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }

  changeArrowImg() {
    this.setState({
      arrowImg: arrowActive
    })
  }

  changeArrowImgOut() {
    this.setState({
      arrowImg: arrowUnactive
    })
  }

  // collapse/uncolappse
  switchSidebar() {
    if (this.props.sidebarOpened) {
      this.props.dispatch(closeSidebar());
      this.props.dispatch(changeActiveSidebarItem(null));
    } else {
      const paths = this.props.location.pathname.split("/");
      paths.pop();
      this.props.dispatch(openSidebar());
      this.props.dispatch(changeActiveSidebarItem(paths.join("/")));
    }
  }

  // tables/non-tables
  toggleSidebar() {
    this.props.dispatch(toggleSidebar());
    if (this.props.sidebarStatic) {
      localStorage.setItem("staticSidebar", "false");
      this.props.dispatch(changeActiveSidebarItem(null));
    } else {
      localStorage.setItem("staticSidebar", "true");
      const paths = this.props.location.pathname.split("/");
      paths.pop();
      this.props.dispatch(changeActiveSidebarItem(paths.join("/")));
    }
  }

  toggleMenu() {
    this.setState({
      menuOpen: !this.state.menuOpen,
    });
  }
  render() {
    const { focus } = this.state;
    const { navbarType, navbarColor, openUsersList } = this.props;
    
    // ✅ 기존
    // const user = JSON.parse(localStorage.getItem("user") || {});
    // const firstUserLetter = (user.name || user.email || "카리나")[0].toUpperCase();

    // ✅ 수정
    const raw = localStorage.getItem("user");
    let user = null;
    try {
      user = raw ? JSON.parse(raw) : null;
    } catch {
      user = null;
    }
    const displayName = (user?.name || user?.email || "User").trim();
    const avatarLetter =
      (user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();


    console.log(user)
    return (
      <Navbar
  className={`${s.root} ${cx({[s.rootLight]: navbarColor === '#FFFFFF'})} d-print-none ${
    navbarType === NavbarTypes.FLOATING ? s.navbarFloatingType : ""
  }`}
  style={{ zIndex: !openUsersList ? 100 : 0, backgroundColor: navbarColor }}
>
  {/* 좌측: 토글/검색 등 */}
  <NavItem className={`${s.toggleSidebarNav} d-md-none d-flex mr-2`}>
    {/* ... */}
  </NavItem>
  <NavItem className={"d-md-down-block d-md-none ml-auto"}>
    {/* ... */}
  </NavItem>

  {/* ① 왼쪽 Nav: 알림/메시지 */}
  <Nav className="align-items-center">
    <Dropdown
      nav
      isOpen={this.state.notificationsOpen}
      toggle={this.toggleNotifications}
      id="basic-nav-dropdown"
      className={s.notificationsMenu}
    >
      <DropdownMenu
        right
        className={`${s.notificationsWrapper} py-0 animated animated-fast fadeInUp`}
      >
        <Notifications />
      </DropdownMenu>
    </Dropdown>

    <Dropdown
      nav
      isOpen={this.state.messagesOpen}
      toggle={this.toggleMessages}
      className={s.notificationsMenu}
    >
      <DropdownMenu
        right
        className={`${s.notificationsWrapper} py-0 animated animated-fast fadeInUp`}
      >
        <Notifications notificationsTabSelected={2} />
      </DropdownMenu>
    </Dropdown>
  </Nav>

  {/* ② 오른쪽 Nav: 계정 (여기에 ml/ms-auto!) */}
  <Nav className="ml-auto align-items-center">{/* BS5라면 ms-auto 로 교체 */}
    <Dropdown
      nav
      isOpen={this.state.accountOpen}
      toggle={this.toggleAccount}
      className={s.notificationsMenu}
    >
      <DropdownToggle
        nav
        className={chroma(navbarColor).luminance() < 0.4 ? "text-white" : ""}
        aria-label="Account menu"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* ✅ 기존 */}
          {/* <span className="navbar-text">AJIN INDUSTRIAL CO.LTD</span> */}
          {/* 오타: calssName */}
          {/* <span calssName="navbar-text">{firstUserLetter}님</span> */}
          {/* <span className={`${s.avatar} rounded-circle thumb-sm`}>
            {user?.avatar || user?.email === "admin@flatlogic.com" ? (
              <img src={user?.avatar || userAvatar} alt="User avatar" />
            ) : (
              <span>{(user?.email?.[0] || "?").toUpperCase()}</span>
            )}
          </span> */}

          {/* ✅ 수정 */}
          <span className="navbar-text">AJIN INDUSTRIAL CO.LTD</span>
          <span className="navbar-text">{displayName} 님</span>
          <span className={`${s.avatar} rounded-circle thumb-sm`}>
            {user?.avatar ? (
              <img src={user.avatar} alt="User avatar" />
            ) : (
              <span>{avatarLetter}</span>
            )}
          </span>
        </div>
      </DropdownToggle>

      {/* 기존 */}
      {/* <DropdownMenu
        end
        className={`${s.notificationsWrapper} py-0 animated animated-fast fadeInUp`}
      >
        <Notifications notificationsTabSelected={4} />
      </DropdownMenu> */}

      {/* 수정: 사용자 정보/로그아웃을 직접 렌더링 */}
      <DropdownMenu
        end
        className={`${s.notificationsWrapper} py-0 animated animated-fast fadeInUp`}
      >
        <div className="p-3">
          <div className="mb-1 font-weight-bold">
            {user?.name || (user?.email?.split('@')[0]) || 'User'}
            {user?.role ? (
              <span className="text-muted" style={{ marginLeft: 8 }}>
                | {user.role}
              </span>
            ) : null}
          </div>
          <div className="text-warning">
            {user?.email || ''}
          </div>
        </div>

        {/* ▶ 원래 템플릿의 메뉴(아이콘 포함) */}
        <Notifications notificationsTabSelected={4} hideHeader />
        
      </DropdownMenu>
    </Dropdown>
  </Nav>
</Navbar>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    navbarType: store.layout.navbarType,
    navbarColor: store.layout.navbarColor,
  };
}

export default withRouter(connect(mapStateToProps)(Header));
