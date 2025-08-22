// src/components/App.js
import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ConnectedRouter } from "connected-react-router";
import { getHistory } from "../index";
import { AdminRoute, UserRoute } from "./RouteComponents";

import ErrorPage from '../pages/error';
import '../styles/theme.scss';
import LayoutComponent from '../components/Layout';
import DocumentationLayoutComponent from '../documentation/DocumentationLayout';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import Forgot from "../pages/auth/forgot";
import Reset from "../pages/auth/reset";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "../styles/theme";

import { changeTheme } from "../actions/layout";

const CloseButton = ({ closeToast }) => (
  <i onClick={closeToast} className="la la-close notifications-close" />
);

const isAuthed = () => !!localStorage.getItem('token');

class App extends React.PureComponent {
  componentDidMount() {
    // 로컬 스토리지에 저장된 테마 모드가 있으면 복원
    const saved = localStorage.getItem('themeMode');
    if (saved && saved !== this.props.dashboardTheme) {
      this.props.dispatch(changeTheme(saved));
    }
  }

  render() {
    const mode = this.props.dashboardTheme === 'dark' ? 'dark' : 'light';
    const theme = getTheme(mode);

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div>
          <ToastContainer
            autoClose={5000}
            hideProgressBar
            closeButton={<CloseButton />}
          />

          <ConnectedRouter history={getHistory()}>
            <HashRouter>
              <Switch>
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
                <Route
                  path="/app/dashboard"
                  exact
                  render={() => <Redirect to="/app/dashboard/analytics" />}
                />

                <UserRoute
                  path="/app"
                  dispatch={this.props.dispatch}
                  component={LayoutComponent}
                />

                <AdminRoute
                  path="/admin"
                  currentUser={this.props.currentUser}
                  dispatch={this.props.dispatch}
                  component={LayoutComponent}
                />

                <Route
                  path="/documentation"
                  exact
                  render={() => <Redirect to="/documentation/getting-started/overview" />}
                />
                <Route path="/documentation" component={DocumentationLayoutComponent} />

                <Route path="/register" exact component={Register} />
                <Route path="/login" exact component={Login} />
                <Route path="/forgot" exact component={Forgot} />
                <Route path="/password-reset" exact component={Reset} />

                <Route path="/error" exact component={ErrorPage} />
                <Route component={ErrorPage} />
              </Switch>
            </HashRouter>
          </ConnectedRouter>
        </div>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  currentUser: state.auth.currentUser,
  dashboardTheme: state.layout.dashboardTheme,
});

export default connect(mapStateToProps)(App);
