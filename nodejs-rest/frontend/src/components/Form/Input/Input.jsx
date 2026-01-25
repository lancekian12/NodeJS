import "./Input.css";

function Input({
  id,
  label,
  control = "input",
  type = "text",
  required = false,
  value,
  placeholder,
  rows = 3,
  valid = false,
  touched = false,
  onChange,
  onBlur
}) {
  const className = `input__field ${valid ? "valid" : "invalid"} ${
    touched ? "touched" : "untouched"
  }`;

  return (
    <div className="input">
      {label && <label htmlFor={id}>{label}</label>}

      {control === "input" && (
        <input
          className={className}
          type={type}
          id={id}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(id, e.target.value, e.target.files)}
          onBlur={onBlur}
        />
      )}

      {control === "textarea" && (
        <textarea
          className={className}
          id={id}
          rows={rows}
          required={required}
          value={value}
          onChange={e => onChange(id, e.target.value)}
          onBlur={onBlur}
        />
      )}
    </div>
  );
}

export default Input;
