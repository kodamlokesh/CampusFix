import { useState } from 'react';
import { CATEGORIES, LOCATION_HINTS, PRIORITIES, slug } from '../constants.js';
import Field from './Field.jsx';

const EMPTY = { title: '', category: '', location: '', priority: 'Medium', description: '' };

function validate(v) {
  const e = {};
  const len = (s) => s.trim().length;
  if (len(v.title) < 3 || len(v.title) > 100) e.title = 'Enter a title between 3 and 100 characters';
  if (!v.category) e.category = 'Choose a category';
  if (len(v.location) < 2 || len(v.location) > 100) e.location = 'Enter where the problem is (2 to 100 characters)';
  if (len(v.description) < 10) e.description = 'Describe the problem in at least 10 characters';
  else if (len(v.description) > 1000) e.description = 'Keep the description under 1000 characters';
  return e;
}

export default function ComplaintForm({ onCreate }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bind = (key) => ({
    id: `f-${key}`,
    value: values[key],
    'aria-invalid': errors[key] ? 'true' : undefined,
    'aria-describedby': errors[key] ? `f-${key}-error` : undefined,
    onChange: (e) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const found = validate(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`f-${first}`)?.focus();

    setSubmitting(true);
    try {
      await onCreate(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])));
      setValues(EMPTY);
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel report-form" onSubmit={handleSubmit} noValidate aria-labelledby="form-title">
      <h2 id="form-title">Report a problem</h2>

      <Field id="f-title" label="What's wrong?" error={errors.title}>
        <input {...bind('title')} maxLength={100} placeholder="Projector not turning on" />
      </Field>

      <div className="row">
        <Field id="f-category" label="Category" error={errors.category}>
          <select {...bind('category')}>
            <option value="">Choose one</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="f-location" label="Location" error={errors.location}>
          <input {...bind('location')} list="location-hints" maxLength={100} placeholder="Room 204, Science Block" />
          <datalist id="location-hints">{LOCATION_HINTS.map((l) => <option key={l} value={l} />)}</datalist>
        </Field>
      </div>

      <fieldset className="priority">
        <legend>Priority</legend>
        <div className="segmented">
          {PRIORITIES.map((p) => (
            <span key={p}>
              <input type="radio" name="priority" id={`prio-${p}`} value={p} checked={values.priority === p}
                onChange={(e) => setValues((v) => ({ ...v, priority: e.target.value }))} />
              <label htmlFor={`prio-${p}`} className={`prio-${slug(p)}`}>{p}</label>
            </span>
          ))}
        </div>
      </fieldset>

      <Field id="f-description" label="Details" error={errors.description} hint={`${values.description.length}/1000`}>
        <textarea {...bind('description')} rows={4} maxLength={1000} placeholder="What happened, and since when?" />
      </Field>

      {formError && <p className="form-error" role="alert">{formError}</p>}
      <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send report'}</button>
    </form>
  );
}
