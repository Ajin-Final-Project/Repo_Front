import React from "react";
import PropTypes from "prop-types";
import { withRouter, Redirect, Link } from "react-router-dom";
import config from "../../../config";
import { connect } from "react-redux";
import { Alert, Button, Label, Input, FormGroup } from "reactstrap";
import Widget from "../../../components/Widget";
import { doInit, loginUser, receiveToken } from "../../../actions/auth";
import jwt from "jsonwebtoken";
import s from "./Login.module.scss";
import img1 from "../../../images/Vector-1.svg";
import img2 from "../../../images/Vector-2.svg";
import img3 from "../../../images/Vector-3.svg";
import img4 from "../../../images/Vector-4.svg";
import signInVideo from "../../../videos/signInVideo_short.mp4";

class Login extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  static isAuthenticated() {
    const token = localStorage.getItem("token");
    if (!config.isBackend && token) return true;
    if (!token) return;
    const date = new Date().getTime() / 1000;
    const data = jwt.decode(token);
    if (!data) return;
    return date < data.exp;
  }

  constructor(props) {
    super(props);
    this.state = { email: "admin@flatlogic.com", password: "password" };
  }

  changeEmail = (e) => this.setState({ email: e.target.value });
  changePassword = (e) => this.setState({ password: e.target.value });

  doLogin = (e) => {
    e.preventDefault();
    this.props.dispatch(
      loginUser({ email: this.state.email, password: this.state.password })
    );
  };

  googleLogin = () => this.props.dispatch(loginUser({ social: "google" }));
  microsoftLogin = () => this.props.dispatch(loginUser({ social: "microsoft" }));

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const token = params.get("token");
    if (token) {
      this.props.dispatch(receiveToken(token));
      this.props.dispatch(doInit());
    }
  }

  signUp = () => this.props.history.push("/register");

  render() {
    // const { from } = this.props.location.state || { from: { pathname: "/app" } };
    const { from } = this.props.location.state || { from: { pathname: "/app/dashboard/analytics" } };

    if (Login.isAuthenticated(localStorage.getItem("token"))) {
      return <Redirect to={from} />;
    }

    return (
      <div className={s.authPage}>
        {/* 비디오: 전체가 보이도록(contain) */}
        <div className={s.videoLayer}>
          <video className={s.backVideo} autoPlay loop muted playsInline>
            <source src={signInVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* 어둡게 오버레이 */}
        <div className={s.overlay} />

        {/* 중앙 카드 */}
        <div className={s.cardWrap}>
          <Widget
            className={`${s.loginCard} my-auto`}   // ← Widget 자체에 카드 스타일 적용
            title={<h3 className="mt-0 mb-2" style={{ fontSize: 40 }}>Login</h3>}
          >
            <p className="widget-auth-info">Welcome Back! Please login to your account</p>

            <form className="mt" onSubmit={this.doLogin}>
              {this.props.errorMessage && (
                <Alert className="alert-sm" color="danger">
                  {this.props.errorMessage}
                </Alert>
              )}

              <div className="form-group">
                <Label htmlFor="login-username">Username</Label>
                <input
                  id="login-username"
                  className="form-control"
                  defaultValue={"admin"}
                  onChange={this.changeEmail}
                  required
                  name="email"
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group mb-2">
                <Label htmlFor="login-password">Password</Label>
                <input
                  id="login-password"
                  className="form-control"
                  defaultValue={"123123"}
                  onChange={this.changePassword}
                  type="password"
                  required
                  name="password"
                  placeholder="Enter your password"
                />
              </div>

              <FormGroup className="checkbox abc-checkbox mb-4 d-flex" check>
                <Input id="remember-me" type="checkbox" />
                <Label htmlFor="remember-me" check className={"mr-auto"}>
                  Remember me
                </Label>
                <Link to="forgot" className={"ml-1"}>Forgot password?</Link>
              </FormGroup>

              <Button type="submit" color="warning" className="auth-btn mb-3" size="sm">
                {this.props.isFetching ? "Loading..." : "LOGIN"}
              </Button>

              <p className="widget-auth-info text-center">Or</p>
              <div className={"d-flex mb-4 mt-3 align-items-center"}>
                <p className={"mb-0"}>Login with</p>
                <a href={"/"}><img src={img1} alt="facebook" className={"ml-3"} /></a>
                <a href={"/"}><img src={img2} alt="github" className={"ml-3"} /></a>
                <a href={"/"}><img src={img3} alt="linkedin" className={"ml-3"} /></a>
                <a href={"/"}><img src={img4} alt="google_plus" className={"ml-3"} /></a>
              </div>

              <div className={"d-flex align-items-center"}>
                Don’t have an account?{" "}
                <Link to="register" className={"ml-1"}>Sign Up here</Link>
              </div>

              <footer className={s.footer}>
                {new Date().getFullYear()} © One React - React Admin Dashboard Template Made by{" "}
                {/* <a href="https://flatlogic.com" rel="noopener noreferrer" target="_blank">Flatlogic LLC</a> */}
              </footer>
            </form>
          </Widget>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isFetching: state.auth.isFetching,
    isAuthenticated: state.auth.isAuthenticated,
    errorMessage: state.auth.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Login));
