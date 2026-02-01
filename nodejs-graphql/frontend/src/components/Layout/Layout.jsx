import { Fragment } from "react";
import "./Layout.css";

function Layout({ header, mobileNav, children }) {
  return (
    <Fragment>
      <header className="main-header">{header}</header>
      {mobileNav}
      <main className="content">{children}</main>
    </Fragment>
  );
}

export default Layout;
