import { Fragment, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Backdrop from "./components/Backdrop/Backdrop";
import Toolbar from "./components/Toolbar/Toolbar";
import MainNavigation from "./components/Navigation/MainNavigation/MainNavigation";
import MobileNavigation from "./components/Navigation/MobileNavigation/MobileNavigation";
import ErrorHandler from "./components/ErrorHandler/ErrorHandler";
import FeedPage from "./pages/Feed/Feed";
import SinglePostPage from "./pages/Feed/SinglePost/SinglePost";
import LoginPage from "./pages/Auth/Login";
import SignupPage from "./pages/Auth/Signup";
import "./App.css";

function App() {
  const navigate = useNavigate();

  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  // ======================
  // AUTO LOGIN
  // ======================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");

    if (!token || !expiryDate) return;

    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }

    const userId = localStorage.getItem("userId");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();

    setIsAuth(true);
    setToken(token);
    setUserId(userId);
    setAutoLogout(remainingMilliseconds);
  }, []);

  // ======================
  // HANDLERS
  // ======================
  const mobileNavHandler = (isOpen) => {
    setShowMobileNav(isOpen);
    setShowBackdrop(isOpen);
  };

  const backdropClickHandler = () => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  };

  const logoutHandler = () => {
    setIsAuth(false);
    setToken(null);
    setUserId(null);
    localStorage.clear();
    navigate("/");
  };

  const loginHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);

    fetch("URL")
      .then((res) => {
        if (res.status === 422) throw new Error("Validation failed.");
        if (res.status !== 200 && res.status !== 201)
          throw new Error("Could not authenticate you!");
        return res.json();
      })
      .then((resData) => {
        setIsAuth(true);
        setToken(resData.token);
        setUserId(resData.userId);
        setAuthLoading(false);

        localStorage.setItem("token", resData.token);
        localStorage.setItem("userId", resData.userId);

        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds,
        );

        localStorage.setItem("expiryDate", expiryDate.toISOString());
        setAutoLogout(remainingMilliseconds);
        navigate("/");
      })
      .catch((err) => {
        setIsAuth(false);
        setAuthLoading(false);
        setError(err);
      });
  };

  const signupHandler = (event, authData) => {
    event.preventDefault();
    setAuthLoading(true);

    fetch("URL")
      .then((res) => {
        if (res.status === 422) throw new Error("Email already exists.");
        if (res.status !== 200 && res.status !== 201)
          throw new Error("Creating user failed.");
        return res.json();
      })
      .then(() => {
        setAuthLoading(false);
        navigate("/");
      })
      .catch((err) => {
        setAuthLoading(false);
        setError(err);
      });
  };

  const setAutoLogout = (milliseconds) => {
    setTimeout(logoutHandler, milliseconds);
  };

  const errorHandler = () => setError(null);

  // ======================
  // ROUTES
  // ======================
  const authRoutes = (
    <Routes>
      <Route
        path="/"
        element={<LoginPage onLogin={loginHandler} loading={authLoading} />}
      />
      <Route
        path="/signup"
        element={<SignupPage onSignup={signupHandler} loading={authLoading} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const privateRoutes = (
    <Routes>
      <Route path="/" element={<FeedPage userId={userId} token={token} />} />
      <Route
        path="/:postId"
        element={<SinglePostPage userId={userId} token={token} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return (
    <Fragment>
      {showBackdrop && <Backdrop onClick={backdropClickHandler} />}
      <ErrorHandler error={error} onHandle={errorHandler} />

      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={() => mobileNavHandler(true)}
              onLogout={logoutHandler}
              isAuth={isAuth}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={showMobileNav}
            mobile
            onChooseItem={() => mobileNavHandler(false)}
            onLogout={logoutHandler}
            isAuth={isAuth}
          />
        }
      />

      {isAuth ? privateRoutes : authRoutes}
    </Fragment>
  );
}

export default App;
