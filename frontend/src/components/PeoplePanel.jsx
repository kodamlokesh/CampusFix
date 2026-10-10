import { useState } from 'react';
import { CATEGORIES } from '../constants.js';
import Field from './Field.jsx';

const EMPTY = { name: '', email: '', password: '', specialty: 'Other' };

function WorkerRow({ w, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="person">
      <div>
        <strong>{w.name}</strong>
        <div className="muted">{w.email} | {w.specialty}</div>
        <div className="muted">{w.openCount} open, {w.resolvedCount} resolved</div>
      </div>
      {confirming ? (
        <span className="confirm">
          Delete this worker?
          <button className="btn btn-danger" onClick={() => onDelete(w._id)}>Delete worker</button>
          <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Keep</button>
        </span>
      ) : (
        <button className="btn btn-ghost" onClick={() => setConfirming(true)}>Delete</button>
      )}
    </li>
  );
}

export default function PeoplePanel({ workers, students, error, onAddWorker, onDeleteWorker }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bind = (k) => ({
    id: `w-${k}`,
    value: values[k],
    'aria-invalid': errors[k] ? 'true' : undefined,
    'aria-describedby': errors[k] ? `w-${k}-error` : undefined,
    onChange: (e) => { setValues((v) => ({ ...v, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })); },
  });

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    const found = {};
    if (values.name.trim().length < 2) found.name = 'Enter the worker\'s name (at least 2 characters)';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) found.email = 'Enter a valid email address';
    if (values.password.length < 6) found.password = 'Use at least 6 characters';
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`w-${first}`)?.focus();

    setSubmitting(true);
    try {
      await onAddWorker({ ...values, name: values.name.trim(), email: values.email.trim() });
      setValues(EMPTY);
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="people">
      <form className="panel report-form" onSubmit={submit} noValidate aria-labelledby="worker-form-title">
        <h2 id="worker-form-title">Add a worker</h2>
        <Field id="w-name" label="Name" error={errors.name}><input {...bind('name')} /></Field>
        <Field id="w-email" label="Email" error={errors.email}><input {...bind('email')} type="email" autoComplete="off" /></Field>
        <Field id="w-password" label="Temporary password" error={errors.password}><input {...bind('password')} type="text" autoComplete="off" /></Field>
        <Field id="w-specialty" label="Specialty" error={errors.specialty}>
          <select {...bind('specialty')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add worker'}</button>
      </form>

      <div className="people-lists">
        {error && <div className="banner" role="alert">{error}</div>}
        <section className="panel" aria-labelledby="workers-title">
          <h2 id="workers-title">Workers ({workers.length})</h2>
          {workers.length ? (
            <ul className="person-list">{workers.map((w) => <WorkerRow key={w._id} w={w} onDelete={onDeleteWorker} />)}</ul>
          ) : (
            <p className="muted">No workers yet. Add one with the form so you can assign reports.</p>
          )}
        </section>
        <section className="panel" aria-labelledby="students-title">
          <h2 id="students-title">Students ({students.length})</h2>
          {students.length ? (
            <ul className="person-list">
              {students.map((s) => (
                <li className="person" key={s._id}>
                  <div><strong>{s.name}</strong><div className="muted">{s.email}</div></div>
                  <span className="muted">{s.reportCount} {s.reportCount === 1 ? 'report' : 'reports'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No students have signed up yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
