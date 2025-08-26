// // import React from "react";
// // import PropTypes from "prop-types";
// // import { connect } from "react-redux";
// // import { Switch, Route, withRouter, Redirect } from "react-router";
// // import { TransitionGroup, CSSTransition } from "react-transition-group";
// // import Hammer from "rc-hammerjs";

// // import Dashboard from "../../pages/dashboard";
// // import { SidebarTypes } from "../../reducers/layout";
// // import Header from "../Header";
// // import Sidebar from "../Sidebar";
// // import {
// //   openSidebar,
// //   closeSidebar,
// //   toggleSidebar,
// // } from "../../actions/navigation";
// // import s from "./Layout.module.scss";
// // import { DashboardThemes } from "../../reducers/layout";
// // import BreadcrumbHistory from "../BreadcrumbHistory";
// // import Helper from "../Helper";

// // // pages
// // import Visits from "../../pages/dashboard/Visits";
// // import Profile from "../../pages/profile";
// // import Email from '../../pages/email';
// // import UserListPage from "../Users/list/UserListPage";
// // import UsersFormPage from "../Users/form/UsersFormPage";
// // import UsersViewPage from "../Users/view/UsersViewPage";
// // import ChangePasswordFormPage from "../Users/changePassword/ChangePasswordFormPage";

// // // 우리가 만든 페이지들
// // import ProductionChart from "../../pages/production/ProductionChart";
// // import ProductionGrid from "../../pages/production/ProductionGrid";
// // import MoldChart from "../../pages/mold/MoldChart";
// // import MoldCleaningData from "../../pages/mold/MoldCleaningData";
// // import DefectProcessChart from "../../pages/defect/DefectProcessChart";
// // import DefectProcessGrid from "../../pages/defect/DefectProcessGrid";
// // import DowntimeChart from "../../pages/downtime/DowntimeChart";
// // import DowntimeGrid from "../../pages/downtime/DowntimeGrid";
// // import InspectionSystemChart from "../../pages/inspection/InspectionSystemChart";
// // import InspectionGrid from "../../pages/inspection/InspectionSystemData";
// // import AdminUserGrid from "../../pages/admin/UserGrid";
// // import MoldShotCountGrid from "../../pages/mold/MoldShotCountData"
// // import MoldBreakDownGrid from "../../pages/mold/MoldBreakDownGrid"

// // class Layout extends React.Component {
// //   static propTypes = {
// //     sidebarStatic: PropTypes.bool,
// //     sidebarOpened: PropTypes.bool,
// //     dashboardTheme: PropTypes.string,
// //     dispatch: PropTypes.func.isRequired,
// //   };

// //   static defaultProps = {
// //     sidebarStatic: true,
// //     sidebarOpened: true,
// //     dashboardTheme: DashboardThemes.DARK,
// //   };

// //   constructor(props) {
// //     super(props);

// //     this.handleSwipe = this.handleSwipe.bind(this);
// //     this.handleCloseSidebar = this.handleCloseSidebar.bind(this);
// //   }

// //   componentDidMount() {
// //     this.handleResize();
// //     window.addEventListener("resize", this.handleResize.bind(this));
// //   }

// //   componentWillUnmount() {
// //     window.removeEventListener("resize", this.handleResize.bind(this));
// //   }

// //   handleResize() {
// //     if (window.innerWidth < 768) {
// //       this.props.dispatch(toggleSidebar());
// //     } else if (window.innerWidth >= 768) {
// //       this.props.dispatch(openSidebar());
// //     }
// //   }

// //   handleCloseSidebar(e) {
// //     if (e.target.closest("#sidebar-drawer") == null && this.props.sidebarOpened && window.innerWidth <= 768) {
// //       this.props.dispatch(toggleSidebar());
// //     }
// //   }

// //   handleSwipe(e) {
// //     if ("ontouchstart" in window) {
// //       if (e.direction === 4) {
// //         this.props.dispatch(openSidebar());
// //         return;
// //       }

// //       if (e.direction === 2 && this.props.sidebarOpened) {
// //         this.props.dispatch(closeSidebar());
// //         return;
// //       }
// //     }
// //   }

// //   render() {
// //     return (
// //       <div
// //         className={[
// //           s.root,
// //           !this.props.sidebarOpened ? s.sidebarClose : "",
// //           "flatlogic-one",
// //           `dashboard-${this.props.sidebarType === SidebarTypes.TRANSPARENT ? "light" : this.props.sidebarColor}`,
// //           `dashboard-${
// //             this.props.dashboardTheme !== "light" &&
// //             this.props.dashboardTheme !== "dark"
// //               ? this.props.dashboardTheme
// //               : "" 
// //           }`,

// //         ].join(" ")}
// //         onClick={e => this.handleCloseSidebar(e)}
// //       >
// //         <Sidebar />
// //         <div className={s.wrap}>
// //           <Header />
// //           <Helper />

// //           <Hammer onSwipe={this.handleSwipe}>
// //             <main className={s.content}>
// //               <BreadcrumbHistory url={this.props.location.pathname} />
// //               <TransitionGroup>
// //                 <CSSTransition
// //                   key={this.props.location.key}
// //                   classNames="fade"
// //                   timeout={200}
// //                 >
// //                   <Switch>
// //                     <Route
// //                       path="/app/dashboard"
// //                       exact
// //                       render={() => <Redirect to="/app/dashboard/analytics" />}
// //                     />
// //                     <Route
// //                       path="/app/dashboard/analytics"
// //                       exact
// //                       component={Dashboard}
// //                     />
// //                     <Route
// //                       path="/app/dashboard/visits"
// //                       exact
// //                       component={Visits}
// //                     />
// //                     <Route
// //                         path="/app/edit_profile"
// //                         exact
// //                         component={UsersFormPage}
// //                     />
// //                     <Route
// //                         path="/app/password"
// //                         exact
// //                         component={ChangePasswordFormPage}
// //                     />
// //                     <Route
// //                       path="/admin"
// //                       exact
// //                       render={() => <Redirect to="/admin/users" />}
// //                     />
// //                     <Route
// //                       path="/admin/users"
// //                       exact
// //                       component={UserListPage}
// //                     />
// //                     <Route
// //                         path="/admin/users/new"
// //                         exact
// //                         component={UsersFormPage}
// //                     />
// //                     <Route
// //                         path="/admin/users/:id/edit"
// //                         exact
// //                         component={UsersFormPage}
// //                     />
// //                     <Route
// //                         path="/admin/users/:id"
// //                         exact
// //                         component={UsersViewPage}
// //                     />
// //                     {/* 생산관리 시스템 */}
// //                     <Route
// //                       path={"/app/production"}
// //                       exact
// //                       render={() => <Redirect to="/app/production/chart" />}
// //                     />
// //                     <Route
// //                       path={"/app/production/chart"}
// //                       exact
// //                       component={ProductionChart}
// //                     />
// //                     <Route
// //                       path={"/app/production/grid"}
// //                       exact
// //                       component={ProductionGrid}
// //                     />
// //                     {/* 금형관리 시스템 */}
// //                     <Route
// //                       path={"/app/mold/chart"}
// //                       exact
// //                       component={MoldChart}
// //                     />
// //                     <Route
// //                       path={"/app/mold/data"}
// //                       exact
// //                       component={MoldCleaningData}
// //                     />
// //                     <Route
// //                       path= {"/app/mold/shotCountData"}
// //                       exact
// //                       component ={MoldShotCountGrid}
// //                     />
// //                     <Route
// //                       path = {"/app/mold/moldBreakDown"}
// //                       exact
// //                       component={MoldBreakDownGrid}
// //                     />
// //                     {/* 불량공정 시스템 */}
// //                     <Route
// //                       path={"/app/defect"}
// //                       exact
// //                       render={() => <Redirect to="/app/defect/chart" />}
// //                     />
// //                     <Route
// //                       path={"/app/defect/chart"}
// //                       exact
// //                       component={DefectProcessChart}
// //                     />
// //                     <Route
// //                       path={"/app/defect/grid"}
// //                       exact
// //                       component={DefectProcessGrid}
// //                     />
// //                     {/* 비가동 통계 시스템 */}
// //                     <Route
// //                       path={"/app/downtime"}
// //                       exact
// //                       render={() => <Redirect to="/app/downtime/chart" />}
// //                     />
// //                     <Route
// //                       path={"/app/downtime/chart"}
// //                       exact
// //                       component={DowntimeChart}
// //                     />
// //                     <Route
// //                       path={"/app/downtime/data"}
// //                       exact
// //                       component={DowntimeGrid}
// //                     />
// //                     {/* 초/중/종품 검사 시스템 */}
// //                     <Route
// //                       path={"/app/inspection"}
// //                       exact
// //                       render={() => <Redirect to="/app/inspection/chart" />}
// //                     />
// //                     <Route
// //                       path={"/app/inspection/chart"}
// //                       exact
// //                       component={InspectionSystemChart}
// //                     />
// //                     <Route
// //                       path={"/app/inspection/data"}
// //                       exact
// //                       component={InspectionGrid}
// //                     />
// //                     {/* 관리자 시스템(사원 관리 데이터) */}
// //                     <Route
// //                       path="/app/admin"
// //                       exact
// //                       render={() => <Redirect to="/app/admin/users" />}
// //                     />
// //                     <Route
// //                       path="/app/admin/users"
// //                       exact
// //                       component={AdminUserGrid}
// //                     />
// //                     <Route path={"/app/profile"} component={Profile} />
// //                     <Route path={"/app/email"} component={Email} />
// //                     <Route render={() => <Redirect to={{pathname: '/error'}}/>}/>
// //                   </Switch>
// //                 </CSSTransition>
// //               </TransitionGroup>
// //             </main>
// //           </Hammer>
// //         </div>
// //       </div>
// //     );
// //   }
// // }

// // function mapStateToProps(store) {
// //   return {
// //     sidebarOpened: store.navigation.sidebarOpened,
// //     sidebarStatic: store.navigation.sidebarStatic,
// //     dashboardTheme: store.layout.dashboardTheme,
// //     sidebarType: store.layout.sidebarType,
// //     sidebarColor: store.layout.sidebarColor,
// //     currentUser: store.auth.currentUser
// //   };
// // }

// // export default withRouter(connect(mapStateToProps)(Layout));

// import React from "react";
// import PropTypes from "prop-types";
// import { connect } from "react-redux";
// import { Switch, Route, withRouter, Redirect } from "react-router";
// import { TransitionGroup, CSSTransition } from "react-transition-group";
// import Hammer from "rc-hammerjs";

// import Dashboard from "../../pages/dashboard";
// import { SidebarTypes } from "../../reducers/layout";
// import Header from "../Header";
// import Sidebar from "../Sidebar";
// import {
//   openSidebar,
//   closeSidebar,
//   toggleSidebar,
// } from "../../actions/navigation";
// import s from "./Layout.module.scss";
// import { DashboardThemes } from "../../reducers/layout";
// import BreadcrumbHistory from "../BreadcrumbHistory";
// import Helper from "../Helper";

// // pages
// import Visits from "../../pages/dashboard/Visits";
// import Profile from "../../pages/profile";
// import Email from "../../pages/email";
// import UserListPage from "../Users/list/UserListPage";
// import UsersFormPage from "../Users/form/UsersFormPage";
// import UsersViewPage from "../Users/view/UsersViewPage";
// import ChangePasswordFormPage from "../Users/changePassword/ChangePasswordFormPage";

// // 우리가 만든 페이지들
// import ProductionChart from "../../pages/production/ProductionChart";
// import ProductionGrid from "../../pages/production/ProductionGrid";
// import MoldChart from "../../pages/mold/MoldChart";
// import MoldCleaningData from "../../pages/mold/MoldCleaningData";
// import DefectProcessChart from "../../pages/defect/DefectProcessChart";
// import DefectProcessGrid from "../../pages/defect/DefectProcessGrid";
// import DowntimeChart from "../../pages/downtime/DowntimeChart";
// import DowntimeGrid from "../../pages/downtime/DowntimeGrid";
// import InspectionSystemChart from "../../pages/inspection/InspectionSystemChart";
// import InspectionGrid from "../../pages/inspection/InspectionSystemData";
// import AdminUserGrid from "../../pages/admin/UserGrid";
// import MoldShotCountGrid from "../../pages/mold/MoldShotCountData";
// import MoldBreakDownGrid from "../../pages/mold/MoldBreakDownGrid";

// class Layout extends React.Component {
//   static propTypes = {
//     sidebarStatic: PropTypes.bool,
//     sidebarOpened: PropTypes.bool,
//     dashboardTheme: PropTypes.string,
//     dispatch: PropTypes.func.isRequired,
//   };

//   static defaultProps = {
//     sidebarStatic: true,
//     sidebarOpened: true,
//     dashboardTheme: DashboardThemes.DARK,
//   };

//   constructor(props) {
//     super(props);

//     this.handleSwipe = this.handleSwipe.bind(this);
//     this.handleCloseSidebar = this.handleCloseSidebar.bind(this);
//     this.handleResize = this.handleResize.bind(this);
//   }

//   componentDidMount() {
//     this.handleResize();
//     window.addEventListener("resize", this.handleResize);
//   }

//   componentWillUnmount() {
//     window.removeEventListener("resize", this.handleResize);
//   }

//   handleResize() {
//     if (window.innerWidth < 768) {
//       // 모바일: 토글 상태 유지(오버레이), 굳이 열어두지 않음
//       this.props.dispatch(closeSidebar());
//     } else {
//       // 데스크톱: 기본은 펼침
//       this.props.dispatch(openSidebar());
//     }
//   }

//   handleCloseSidebar(e) {
//     if (
//       e.target.closest("#sidebar-drawer") == null &&
//       this.props.sidebarOpened &&
//       window.innerWidth <= 768
//     ) {
//       this.props.dispatch(toggleSidebar());
//     }
//   }

//   handleSwipe(e) {
//     if ("ontouchstart" in window) {
//       if (e.direction === 4) {
//         this.props.dispatch(openSidebar());
//         return;
//       }

//       if (e.direction === 2 && this.props.sidebarOpened) {
//         this.props.dispatch(closeSidebar());
//         return;
//       }
//     }
//   }

//   render() {
//     // 사이드바 폭을 CSS 변수(--sidebar-w)로 넘긴다.
//     const sidebarWidthVar = this.props.sidebarOpened
//       ? "var(--sidebar-open-w)"
//       : "var(--sidebar-mini-w)";

//     return (
//       <div
//         className={[
//           s.root,
//           !this.props.sidebarOpened ? s.sidebarClose : "",
//           "flatlogic-one",
//           `dashboard-${
//             this.props.sidebarType === SidebarTypes.TRANSPARENT
//               ? "light"
//               : this.props.sidebarColor
//           }`,
//           `dashboard-${
//             this.props.dashboardTheme !== "light" &&
//             this.props.dashboardTheme !== "dark"
//               ? this.props.dashboardTheme
//               : ""
//           }`,
//         ].join(" ")}
//         style={{ "--sidebar-w": sidebarWidthVar }}
//         onClick={this.handleCloseSidebar}
//       >
//         <Sidebar />
//         <div className={s.wrap}>
//           <Header />
//           <Helper />

//           <Hammer onSwipe={this.handleSwipe}>
//             <main className={s.content}>
//               <BreadcrumbHistory url={this.props.location.pathname} />
//               <TransitionGroup>
//                 <CSSTransition
//                   key={this.props.location.key}
//                   classNames="fade"
//                   timeout={200}
//                 >
//                   <Switch>
//                     <Route
//                       path="/app/dashboard"
//                       exact
//                       render={() => <Redirect to="/app/dashboard/analytics" />}
//                     />
//                     <Route
//                       path="/app/dashboard/analytics"
//                       exact
//                       component={Dashboard}
//                     />
//                     <Route
//                       path="/app/dashboard/visits"
//                       exact
//                       component={Visits}
//                     />
//                     <Route
//                       path="/app/edit_profile"
//                       exact
//                       component={UsersFormPage}
//                     />
//                     <Route
//                       path="/app/password"
//                       exact
//                       component={ChangePasswordFormPage}
//                     />
//                     <Route
//                       path="/admin"
//                       exact
//                       render={() => <Redirect to="/admin/users" />}
//                     />
//                     <Route path="/admin/users" exact component={UserListPage} />
//                     <Route
//                       path="/admin/users/new"
//                       exact
//                       component={UsersFormPage}
//                     />
//                     <Route
//                       path="/admin/users/:id/edit"
//                       exact
//                       component={UsersFormPage}
//                     />
//                     <Route
//                       path="/admin/users/:id"
//                       exact
//                       component={UsersViewPage}
//                     />
//                     {/* 생산관리 시스템 */}
//                     <Route
//                       path={"/app/production"}
//                       exact
//                       render={() => <Redirect to="/app/production/chart" />}
//                     />
//                     <Route
//                       path={"/app/production/chart"}
//                       exact
//                       component={ProductionChart}
//                     />
//                     <Route
//                       path={"/app/production/grid"}
//                       exact
//                       component={ProductionGrid}
//                     />
//                     {/* 금형관리 시스템 */}
//                     <Route
//                       path={"/app/mold/chart"}
//                       exact
//                       component={MoldChart}
//                     />
//                     <Route
//                       path={"/app/mold/data"}
//                       exact
//                       component={MoldCleaningData}
//                     />
//                     <Route
//                       path={"/app/mold/shotCountData"}
//                       exact
//                       component={MoldShotCountGrid}
//                     />
//                     <Route
//                       path={"/app/mold/moldBreakDown"}
//                       exact
//                       component={MoldBreakDownGrid}
//                     />
//                     {/* 불량공정 시스템 */}
//                     <Route
//                       path={"/app/defect"}
//                       exact
//                       render={() => <Redirect to="/app/defect/chart" />}
//                     />
//                     <Route
//                       path={"/app/defect/chart"}
//                       exact
//                       component={DefectProcessChart}
//                     />
//                     <Route
//                       path={"/app/defect/grid"}
//                       exact
//                       component={DefectProcessGrid}
//                     />
//                     {/* 비가동 통계 시스템 */}
//                     <Route
//                       path={"/app/downtime"}
//                       exact
//                       render={() => <Redirect to="/app/downtime/chart" />}
//                     />
//                     <Route
//                       path={"/app/downtime/chart"}
//                       exact
//                       component={DowntimeChart}
//                     />
//                     <Route
//                       path={"/app/downtime/data"}
//                       exact
//                       component={DowntimeGrid}
//                     />
//                     {/* 초/중/종품 검사 시스템 */}
//                     <Route
//                       path={"/app/inspection"}
//                       exact
//                       render={() => <Redirect to="/app/inspection/chart" />}
//                     />
//                     <Route
//                       path={"/app/inspection/chart"}
//                       exact
//                       component={InspectionSystemChart}
//                     />
//                     <Route
//                       path={"/app/inspection/data"}
//                       exact
//                       component={InspectionGrid}
//                     />
//                     {/* 관리자 시스템(사원 관리 데이터) */}
//                     <Route
//                       path="/app/admin"
//                       exact
//                       render={() => <Redirect to="/app/admin/users" />}
//                     />
//                     <Route
//                       path="/app/admin/users"
//                       exact
//                       component={AdminUserGrid}
//                     />
//                     <Route path={"/app/profile"} component={Profile} />
//                     <Route path={"/app/email"} component={Email} />
//                     <Route
//                       render={() => <Redirect to={{ pathname: "/error" }} />}
//                     />
//                   </Switch>
//                 </CSSTransition>
//               </TransitionGroup>
//             </main>
//           </Hammer>
//         </div>
//       </div>
//     );
//   }
// }

// function mapStateToProps(store) {
//   return {
//     sidebarOpened: store.navigation.sidebarOpened,
//     sidebarStatic: store.navigation.sidebarStatic,
//     dashboardTheme: store.layout.dashboardTheme,
//     sidebarType: store.layout.sidebarType,
//     sidebarColor: store.layout.sidebarColor,
//     currentUser: store.auth.currentUser,
//   };
// }

// export default withRouter(connect(mapStateToProps)(Layout));


// src/components/Layout/Layout.js
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Switch, Route, withRouter, Redirect } from "react-router";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import Dashboard from "../../pages/dashboard";
import { SidebarTypes } from "../../reducers/layout";
import Header from "../Header";
import Sidebar from "../Sidebar";
import s from "./Layout.module.scss";
import { DashboardThemes } from "../../reducers/layout";
import BreadcrumbHistory from "../BreadcrumbHistory";
import Helper from "../Helper";

// pages
import Visits from "../../pages/dashboard/Visits";
import Profile from "../../pages/profile";
import Email from "../../pages/email";
import UserListPage from "../Users/list/UserListPage";
import UsersFormPage from "../Users/form/UsersFormPage";
import UsersViewPage from "../Users/view/UsersViewPage";
import ChangePasswordFormPage from "../Users/changePassword/ChangePasswordFormPage";

// 우리가 만든 페이지들
import ProductionChart from "../../pages/production/ProductionChart";
import ProductionGrid from "../../pages/production/ProductionGrid";
import MoldChart from "../../pages/mold/MoldChart";
import MoldCleaningData from "../../pages/mold/MoldCleaningData";
import DefectProcessChart from "../../pages/defect/DefectProcessChart";
import DefectProcessGrid from "../../pages/defect/DefectProcessGrid";
import DowntimeChart from "../../pages/downtime/DowntimeChart";
import DowntimeGrid from "../../pages/downtime/DowntimeGrid";
import InspectionSystemChart from "../../pages/inspection/InspectionSystemChart";
import InspectionGrid from "../../pages/inspection/InspectionSystemData";
import AdminUserGrid from "../../pages/admin/UserGrid";
import MoldShotCountGrid from "../../pages/mold/MoldShotCountData";
import MoldBreakDownGrid from "../../pages/mold/MoldBreakDownGrid";

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

  render() {
    // (선택) CSS 변수로 사이드바 폭을 넘기고 싶다면 유지
    const sidebarWidthVar = this.props.sidebarOpened
      ? "var(--sidebar-open-w)"
      : "var(--sidebar-mini-w)";

    return (
      <div
        className={[
          s.root,
          !this.props.sidebarOpened ? s.sidebarClose : "",
          "flatlogic-one",
          `dashboard-${
            this.props.sidebarType === SidebarTypes.TRANSPARENT
              ? "light"
              : this.props.sidebarColor
          }`,
          `dashboard-${
            this.props.dashboardTheme !== "light" &&
            this.props.dashboardTheme !== "dark"
              ? this.props.dashboardTheme
              : ""
          }`,
        ].join(" ")}
        style={{ "--sidebar-w": sidebarWidthVar }}
      >
        <Sidebar />
        <div className={s.wrap}>
          <Header />
          <Helper />

          {/* 클릭으로만 열고 닫도록 Hammer/onSwipe 제거 */}
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
                  <Route path="/admin/users" exact component={UserListPage} />
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

                  {/* 금형관리 시스템 */}
                  <Route
                    path={"/app/mold/chart"}
                    exact
                    component={MoldChart}
                  />
                  <Route
                    path={"/app/mold/data"}
                    exact
                    component={MoldCleaningData}
                  />
                  <Route
                    path={"/app/mold/shotCountData"}
                    exact
                    component={MoldShotCountGrid}
                  />
                  <Route
                    path={"/app/mold/moldBreakDown"}
                    exact
                    component={MoldBreakDownGrid}
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
                    component={InspectionGrid}
                  />

                  {/* 관리자 시스템(사원 관리 데이터) */}
                  <Route
                    path="/app/admin"
                    exact
                    render={() => <Redirect to="/app/admin/users" />}
                  />
                  <Route
                    path="/app/admin/users"
                    exact
                    component={AdminUserGrid}
                  />

                  <Route path={"/app/profile"} component={Profile} />
                  <Route path={"/app/email"} component={Email} />
                  <Route
                    render={() => <Redirect to={{ pathname: "/error" }} />}
                  />
                </Switch>
              </CSSTransition>
            </TransitionGroup>
          </main>
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
    currentUser: store.auth.currentUser,
  };
}

export default withRouter(connect(mapStateToProps)(Layout));
