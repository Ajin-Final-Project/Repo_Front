// src/components/App.js
import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ConnectedRouter } from "connected-react-router";
import { getHistory } from "../index";
import { AdminRoute, UserRoute } from "./RouteComponents";

/* eslint-disable */
import ErrorPage from '../pages/error';
/* eslint-enable */

import '../styles/theme.scss';
import LayoutComponent from '../components/Layout';
import DocumentationLayoutComponent from '../documentation/DocumentationLayout';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import Forgot from "../pages/auth/forgot";
import Reset from "../pages/auth/reset";

const CloseButton = ({ closeToast }) => (
  <i onClick={closeToast} className="la la-close notifications-close" />
);

// 로컬 토큰 기준으로 인증 여부 판정
const isAuthed = () => !!localStorage.getItem('token');

class App extends React.PureComponent {
  render() {
    { console.log(this.props) }
    return (
      <div>
        <ToastContainer
          autoClose={5000}
          hideProgressBar
          closeButton={<CloseButton />}
        />
        <ConnectedRouter history={getHistory()}>
          <HashRouter>
            <Switch>
              {/* 기본 진입 분기: 토큰 있으면 대시보드, 없으면 로그인 */}
              <Route
                path="/"
                exact
                render={() =>
                  isAuthed()
                    ? <Redirect to="/app/dashboard/analytics" />
                    : <Redirect to="/login" />
                }
              />
              <Route
                path="/app"
                exact
                render={() =>
                  isAuthed()
                    ? <Redirect to="/app/dashboard/analytics" />
                    : <Redirect to="/login" />
                }
              />

              {/* 안전망: /app/dashboard 로 들어와도 Analytics로 */}
              <Route
                path="/app/dashboard"
                exact
                render={() => <Redirect to="/app/dashboard/analytics" />}
              />

              {/* 보호된 앱 라우트 (로그인 필요) */}
              <UserRoute
                path="/app"
                dispatch={this.props.dispatch}
                component={LayoutComponent}
              />

              {/* Admin 영역 */}
              <AdminRoute
                path="/admin"
                currentUser={this.props.currentUser}
                dispatch={this.props.dispatch}
                component={LayoutComponent}
              />

              {/* 문서 */}
              <Route
                path="/documentation"
                exact
                render={() => <Redirect to="/documentation/getting-started/overview" />}
              />
              <Route path="/documentation" component={DocumentationLayoutComponent} />

              {/* 인증 */}
              <Route path="/register" exact component={Register} />
              <Route path="/login" exact component={Login} />
              <Route path="/forgot" exact component={Forgot} />
              <Route path="/password-reset" exact component={Reset} />

              {/* 에러/기타 */}
              <Route path="/error" exact component={ErrorPage} />
              <Route component={ErrorPage} />
            </Switch>
          </HashRouter>
        </ConnectedRouter>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  currentUser: state.auth.currentUser,
});

export default connect(mapStateToProps)(App);
