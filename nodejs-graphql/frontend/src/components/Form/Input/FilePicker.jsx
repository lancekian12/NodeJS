import "./Input.css";

function FilePicker({ id, label, valid = false, touched = false, onChange, onBlur }) {
  const className = `input__field ${valid ? "valid" : "invalid"} ${
    touched ? "touched" : "untouched"
  }`;

  return (
    <div className="input">
      <label htmlFor={id}>{label}</label>
      <input
        className={className}
        type="file"
        id={id}
        onChange={e => onChange(id, e.target.value, e.target.files)}
        onBlur={onBlur}
      />
    </div>
  );
}

export default FilePicker;
