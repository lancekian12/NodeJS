import React from "react";
import NavigationItems from "../NavigationItems/NavigationItems";
import "./MobileNavigation.css";

function MobileNavigation({ open, mobile = true, onChooseItem, isAuth, onLogout }) {
  return (
    <nav className={`mobile-nav ${open ? "open" : ""}`}>
      <ul className={`mobile-nav__items ${mobile ? "mobile" : ""}`}>
        <NavigationItems
          mobile
          onChoose={onChooseItem}
          isAuth={isAuth}
          onLogout={onLogout}
        />
      </ul>
    </nav>
  );
}

export default MobileNavigation;
