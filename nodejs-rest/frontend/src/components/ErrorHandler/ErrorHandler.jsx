import { Fragment } from "react";
import Backdrop from "../Backdrop/Backdrop";
import Modal from "../Modal/Modal";

function ErrorHandler({ error, onHandle }) {
  if (!error) return null;

  return (
    <Fragment>
      <Backdrop onClick={onHandle} />
      <Modal
        title="An Error Occurred"
        onCancelModal={onHandle}
        onAcceptModal={onHandle}
        acceptEnabled
      >
        <p>{error.message}</p>
      </Modal>
    </Fragment>
  );
}

export default ErrorHandler;
