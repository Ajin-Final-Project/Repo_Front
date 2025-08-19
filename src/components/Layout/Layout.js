import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Redirect } from "react-router";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Hammer from "rc-hammerjs";

import Dashboard from "../../pages/dashboard";
import { SidebarTypes } from "../../reducers/layout";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {
  openSidebar,
  closeSidebar,
  toggleSidebar,
} from "../../actions/navigation";
import s from "./Layout.module.scss";
import { DashboardThemes } from "../../reducers/layout";
import BreadcrumbHistory from "../BreadcrumbHistory";
import Helper from "../Helper";

// pages
import Visits from "../../pages/dashboard/Visits";
import Profile from "../../pages/profile";
import Email from '../../pages/email';
import UserListPage from "../Users/list/UserListPage";
import UsersFormPage from "../Users/form/UsersFormPage";
import UsersViewPage from "../Users/view/UsersViewPage";
import ChangePasswordFormPage from "../Users/changePassword/ChangePasswordFormPage";

// 우리가 만든 페이지들
import ProductionChart from "../../pages/production/ProductionChart";
import ProductionGrid from "../../pages/production/ProductionGrid";
import MoldCleaningChart from "../../pages/mold/MoldCleaningChart";
import MoldCleaningData from "../../pages/mold/MoldCleaningData";
import DefectProcessChart from "../../pages/defect/DefectProcessChart";
import DefectProcessGrid from "../../pages/defect/DefectProcessGrid";
import DowntimeChart from "../../pages/downtime/DowntimeChart";
import DowntimeGrid from "../../pages/downtime/DowntimeGrid";
import InspectionSystemChart from "../../pages/inspection/InspectionSystemChart";
import InspectionSystemData from "../../pages/inspection/InspectionSystemData";

class Layout extends React.Component {
  static propTypes = {
    sidebarStatic: PropTypes.bool,
    sidebarOpened: PropTypes.bool,
    dashboardTheme: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    sidebarStatic: true,
    sidebarOpened: true,
    dashboardTheme: DashboardThemes.DARK,
  };

  constructor(props) {
    super(props);

    this.handleSwipe = this.handleSwipe.bind(this);
    this.handleCloseSidebar = this.handleCloseSidebar.bind(this);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize.bind(this));
  }

  handleResize() {
    if (window.innerWidth < 768) {
      this.props.dispatch(toggleSidebar());
    } else if (window.innerWidth >= 768) {
      this.props.dispatch(openSidebar());
    }
  }

  handleCloseSidebar(e) {
    if (e.target.closest("#sidebar-drawer") == null && this.props.sidebarOpened && window.innerWidth <= 768) {
      this.props.dispatch(toggleSidebar());
    }
  }

  handleSwipe(e) {
    if ("ontouchstart" in window) {
      if (e.direction === 4) {
        this.props.dispatch(openSidebar());
        return;
      }

      if (e.direction === 2 && this.props.sidebarOpened) {
        this.props.dispatch(closeSidebar());
        return;
      }
    }
  }

  render() {
    return (
      <div
        className={[
          s.root,
          !this.props.sidebarOpened ? s.sidebarClose : "",
          "flatlogic-one",
          `dashboard-${this.props.sidebarType === SidebarTypes.TRANSPARENT ? "light" : this.props.sidebarColor}`,
          `dashboard-${
            this.props.dashboardTheme !== "light" &&
            this.props.dashboardTheme !== "dark"
              ? this.props.dashboardTheme
              : "" 
          }`,

        ].join(" ")}
        onClick={e => this.handleCloseSidebar(e)}
      >
        <Sidebar />
        <div className={s.wrap}>
          <Header />
          <Helper />

          <Hammer onSwipe={this.handleSwipe}>
            <main className={s.content}>
              <BreadcrumbHistory url={this.props.location.pathname} />
              <TransitionGroup>
                <CSSTransition
                  key={this.props.location.key}
                  classNames="fade"
                  timeout={200}
                >
                  <Switch>
                    <Route
                      path="/app/dashboard"
                      exact
                      render={() => <Redirect to="/app/dashboard/analytics" />}
                    />
                    <Route
                      path="/app/dashboard/analytics"
                      exact
                      component={Dashboard}
                    />
                    <Route
                      path="/app/dashboard/visits"
                      exact
                      component={Visits}
                    />
                    <Route
                        path="/app/edit_profile"
                        exact
                        component={UsersFormPage}
                    />
                    <Route
                        path="/app/password"
                        exact
                        component={ChangePasswordFormPage}
                    />
                    <Route
                      path="/admin"
                      exact
                      render={() => <Redirect to="/admin/users" />}
                    />
                    <Route
                      path="/admin/users"
                      exact
                      component={UserListPage}
                    />
                    <Route
                        path="/admin/users/new"
                        exact
                        component={UsersFormPage}
                    />
                    <Route
                        path="/admin/users/:id/edit"
                        exact
                        component={UsersFormPage}
                    />
                    <Route
                        path="/admin/users/:id"
                        exact
                        component={UsersViewPage}
                    />
                    {/* 생산관리 시스템 */}
                    <Route
                      path={"/app/production"}
                      exact
                      render={() => <Redirect to="/app/production/chart" />}
                    />
                    <Route
                      path={"/app/production/chart"}
                      exact
                      component={ProductionChart}
                    />
                    <Route
                      path={"/app/production/grid"}
                      exact
                      component={ProductionGrid}
                    />
                    {/* 금형세척 시스템 */}
                    <Route
                      path={"/app/mold"}
                      exact
                      render={() => <Redirect to="/app/mold/chart" />}
                    />
                    <Route
                      path={"/app/mold/chart"}
                      exact
                      component={MoldCleaningChart}
                    />
                    <Route
                      path={"/app/mold/data"}
                      exact
                      component={MoldCleaningData}
                    />
                    {/* 불량공정 시스템 */}
                    <Route
                      path={"/app/defect"}
                      exact
                      render={() => <Redirect to="/app/defect/chart" />}
                    />
                    <Route
                      path={"/app/defect/chart"}
                      exact
                      component={DefectProcessChart}
                    />
                    <Route
                      path={"/app/defect/grid"}
                      exact
                      component={DefectProcessGrid}
                    />
                    {/* 비가동 통계 시스템 */}
                    <Route
                      path={"/app/downtime"}
                      exact
                      render={() => <Redirect to="/app/downtime/chart" />}
                    />
                    <Route
                      path={"/app/downtime/chart"}
                      exact
                      component={DowntimeChart}
                    />
                    <Route
                      path={"/app/downtime/data"}
                      exact
                      component={DowntimeGrid}
                    />
                    {/* 초/중/종품 검사 시스템 */}
                    <Route
                      path={"/app/inspection"}
                      exact
                      render={() => <Redirect to="/app/inspection/chart" />}
                    />
                    <Route
                      path={"/app/inspection/chart"}
                      exact
                      component={InspectionSystemChart}
                    />
                    <Route
                      path={"/app/inspection/data"}
                      exact
                      component={InspectionSystemData}
                    />
                    <Route path={"/app/profile"} component={Profile} />
                    <Route path={"/app/email"} component={Email} />
                    <Route render={() => <Redirect to={{pathname: '/error'}}/>}/>
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
            </main>
          </Hammer>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    dashboardTheme: store.layout.dashboardTheme,
    sidebarType: store.layout.sidebarType,
    sidebarColor: store.layout.sidebarColor,
    currentUser: store.auth.currentUser
  };
}

export default withRouter(connect(mapStateToProps)(Layout));
