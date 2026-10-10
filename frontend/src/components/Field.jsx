export default function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="error" id={`${id}-error`}>{error}</span>}
    </div>
  );
}
