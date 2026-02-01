import { Link } from "react-router-dom";
import "./Button.css";

function Button({
  link,
  design = "default",
  mode = "flat",
  onClick,
  disabled,
  loading,
  type = "button",
  children
}) {
  const className = `button button--${design} button--${mode}`;

  if (!link) {
    return (
      <button
        className={className}
        onClick={onClick}
        disabled={disabled || loading}
        type={type}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  }

  return (
    <Link className={className} to={link}>
      {children}
    </Link>
  );
}

export default Button;
