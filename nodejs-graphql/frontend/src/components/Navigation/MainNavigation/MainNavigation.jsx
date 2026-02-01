import React from "react";
import { NavLink } from "react-router-dom";

import MobileToggle from "../MobileToggle/MobileToggle";
import Logo from "../../Logo/Logo";
import NavigationItems from "../NavigationItems/NavigationItems";

import "./MainNavigation.css";

function MainNavigation({ onOpenMobileNav, isAuth, onLogout }) {
  return (
    <nav className="main-nav">
      <MobileToggle onOpen={onOpenMobileNav} />
      <div className="main-nav__logo">
        <NavLink to="/" end>
          <Logo />
        </NavLink>
      </div>
      <div className="spacer" />
      <ul className="main-nav__items">
        <NavigationItems isAuth={isAuth} onLogout={onLogout} />
      </ul>
    </nav>
  );
}

export default MainNavigation;
