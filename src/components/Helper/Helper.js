// src/components/Helper/Helper.jsx (파일 경로는 기존과 동일하게 유지)
import React, { Component } from "react";
import cx from "classnames";
import { Button } from "reactstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  DashboardThemes,
  SidebarTypes,
  NavbarTypes,
} from "../../reducers/layout";
import {
  changeTheme,
  changeThemeColor,
  changeSidebarColor,
  changeNavbarColor,
  navbarTypeToggle,
  sidebarTypeToggle,
} from "../../actions/layout";
import CustomColorPicker from "../ColorPicker";
import config from "../../config";

import themeImg from "../../images/theme-change-img.svg";
import Widget from "../Widget";

import s from "./Helper.module.scss"; // eslint-disable-line

class Helper extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    dashboardTheme: PropTypes.string,
  };

  static defaultProps = {
    dashboardTheme: DashboardThemes.DARK,
  };

  state = {
    isOpened: false,
  };

  toggle = () => {
    this.setState({ isOpened: !this.state.isOpened });
  };

  changeTheme = (state) => {
    // 기존: 사이드바 컬러 변경 핸들러 (이름이 살짝 혼동될 수 있지만 기존 로직 유지)
    this.props.dispatch(changeSidebarColor(state));
    if (state === 'dark') {
      this.props.dispatch(sidebarTypeToggle("solid"));
    }
  };

  navbarStateToggle = (state) => {
    this.props.dispatch(navbarTypeToggle(state));
  };

  sidebarStateToggle = (state) => {
    this.props.dispatch(sidebarTypeToggle(state));
    if (state === 'transparent') {
      this.props.dispatch(changeSidebarColor("light"));
    }
  };

  updateColor = (value) => {
    this.props.dispatch(changeNavbarColor(value));
  };

  updateThemeColor = (value) => {
    this.props.dispatch(changeTheme(value));
    this.props.dispatch(changeThemeColor(value));
    // 주의: 여기의 value는 기존 "themeColor" 팔레트(예: warning/success 등) 용도였음
  };

  // ✅ 새로 추가: 메인 콘텐츠(전체 테마) Light/Dark 전환
  setMainContentTheme = (mode) => {
    const normalized = mode === DashboardThemes.DARK ? 'dark' : 'light';
    this.props.dispatch(changeTheme(normalized)); // layout.dashboardTheme 갱신
    localStorage.setItem('themeMode', normalized); // 새로고침 유지
  };

  render() {
    const { isOpened } = this.state;
    const {
      navbarColor,
      sidebarColor,
      navbarType,
      sidebarType,
      dashboardTheme,
      themeColor,
    } = this.props;

    return (
      <div className={cx(s.themeHelper, { [s.themeHelperOpened]: isOpened })} style={{ backgroundColor: "black" }}>
        <div className={`${s.themeHelperBtn} helper-button`} onClick={this.toggle}>
          <img src={themeImg} alt="theme-color-change" className={"mr-1"} width={"30px"} />
        </div>

        <Widget className={`${s.themeHelperContent} mb-0 rounded-0`}>
          <div className={s.helperHeader}>
            <h5 className="m-0 fw-bold">Theme</h5>
          </div>

          <div className="theme-settings">
            {/* Navbar Type */}
            <h6 className="navbar-type-switcher mb-3 fw-semi-bold">Navbar Type</h6>
            <div className="form-group row">
              <div className="abc-radio">
                <input
                  onChange={() => this.navbarStateToggle(NavbarTypes.STATIC)}
                  type="radio"
                  checked={navbarType === NavbarTypes.STATIC}
                  name="navbar-type"
                  id="navbar_static"
                />
                <label htmlFor="navbar_static">Static</label>
              </div>

              <div className="abc-radio">
                <input
                  onChange={() => this.navbarStateToggle(NavbarTypes.FLOATING)}
                  type="radio"
                  checked={navbarType === NavbarTypes.FLOATING}
                  name="navbar-type"
                  id="navbar_floating"
                />
                <label htmlFor="navbar_floating">Floating</label>
              </div>
            </div>

            {/* Navbar Color */}
            <h6 className="mt-4 navbar-color-picker mb-3 fw-semi-bold">Navbar Color</h6>
            <CustomColorPicker
              colors={config.app.colors}
              activeColor={navbarColor}
              updateColor={this.updateColor}
              customizationItem={"navbar"}
            />

            {/* Sidebar Type */}
            <h6 className="mt-4 sidebar-type-switcher mb-3 fw-semi-bold">Sidebar Type</h6>
            <div className="form-group row">
              <div className="abc-radio">
                <input
                  type="radio"
                  onChange={() => this.sidebarStateToggle(SidebarTypes.TRANSPARENT)}
                  checked={sidebarType === SidebarTypes.TRANSPARENT ? true : ""}
                  name="sidebar-type"
                  id="sidebar_transparent"
                />
                <label htmlFor="sidebar_transparent">Transparent</label>
              </div>

              <div className="abc-radio">
                <input
                  type="radio"
                  onChange={() => this.sidebarStateToggle(SidebarTypes.SOLID)}
                  checked={sidebarType === SidebarTypes.SOLID ? true : ""}
                  name="sidebar-type"
                  id="sidebar_solid"
                />
                <label htmlFor="sidebar_solid">Solid</label>
              </div>
            </div>

            {/* Sidebar Color */}
            <h6 className="mt-4 sidebar-color-picker mb-3 fw-semi-bold">Sidebar Color</h6>
            <CustomColorPicker
              colors={config.app.colors}
              activeColor={sidebarColor}
              updateColor={this.changeTheme}
              customizationItem={"sidebar"}
            />

            {/* MainContent Color */}
            <h6 className="mt-4 main-content-color mb-3 fw-semi-bold">MainContent Color</h6>
            <div className="form-group row">
              <div className="abc-radio">
                <input
                  type="radio"
                  id="main_light"
                  name="main-content"
                  checked={dashboardTheme === DashboardThemes.LIGHT || dashboardTheme === 'light'}
                  onChange={() => this.setMainContentTheme(DashboardThemes.LIGHT)}
                />
                <label htmlFor="main_light">Light</label>
              </div>

              <div className="abc-radio">
                <input
                  type="radio"
                  id="main_dark"
                  name="main-content"
                  checked={dashboardTheme === DashboardThemes.DARK || dashboardTheme === 'dark'}
                  onChange={() => this.setMainContentTheme(DashboardThemes.DARK)}
                />
                <label htmlFor="main_dark">Dark</label>
              </div>
            </div>

            {/* Theme Color (브랜드/포인트 컬러 팔레트) */}
            <h6 className="mt-4 navbar-color-picker mb-3 fw-semi-bold">Theme Color</h6>
            <CustomColorPicker
              colors={config.app.themeColors}
              activeColor={themeColor}
              updateColor={this.updateThemeColor}
              customizationItem={"theme"}
            />
          </div>

          <div className="mt-5">
            <Button
              href="https://flatlogic.com/admin-dashboards/sing-app-react"
              target="_blank"
              className="btn-block fs-mini purchase-button"
              style={{ backgroundColor: "#323232" }}
            >
              <span className="text-white">Purchase</span>
            </Button>
            <Button
              href="http://demo.flatlogic.com/sing-app/documentation/"
              target="_blank"
              className="btn-block fs-mini text-white mt-3"
              color="warning"
            >
              Documentation
            </Button>
          </div>
        </Widget>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    dashboardTheme: store.layout.dashboardTheme,
    sidebarColor: store.layout.sidebarColor,
    navbarColor: store.layout.navbarColor,
    navbarType: store.layout.navbarType,
    sidebarType: store.layout.sidebarType,
    themeColor: store.layout.themeColor,
  };
}

export default connect(mapStateToProps)(Helper);
