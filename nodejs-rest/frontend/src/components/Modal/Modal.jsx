import React from "react";
import ReactDOM from "react-dom";

import Button from "../Button/Button";
import "./Modal.css";

function Modal({
  title,
  children,
  onCancelModal,
  onAcceptModal,
  acceptEnabled = false,
  isLoading = false
}) {
  return ReactDOM.createPortal(
    <div className="modal">
      <header className="modal__header">
        <h1>{title}</h1>
      </header>
      <div className="modal__content">{children}</div>
      <div className="modal__actions">
        <Button design="danger" mode="flat" onClick={onCancelModal}>
          Cancel
        </Button>
        <Button
          mode="raised"
          onClick={onAcceptModal}
          disabled={!acceptEnabled}
          loading={isLoading}
        >
          Accept
        </Button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default Modal;
