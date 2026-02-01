import { createPortal } from "react-dom";
import "./Backdrop.css";

function Backdrop({ open, onClick }) {
  return createPortal(
    <div
      className={`backdrop ${open ? "open" : ""}`}
      onClick={onClick}
    />,
    document.getElementById("backdrop-root")
  );
}

export default Backdrop;
