import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import Field from '../components/Field.jsx';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === 'login';

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const switchMode = () => { setMode(isLogin ? 'register' : 'login'); setErrors({}); setFormError(''); };

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    const found = {};
    if (!isLogin && values.name.trim().length < 2) found.name = 'Enter your name (at least 2 characters)';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) found.email = 'Enter a valid email address';
    if (values.password.length < (isLogin ? 1 : 6)) found.password = isLogin ? 'Enter your password' : 'Use at least 6 characters';
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`a-${first}`)?.focus();

    setSubmitting(true);
    try {
      if (isLogin) await login(values.email.trim(), values.password);
      else await register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const bind = (k) => ({ id: `a-${k}`, value: values[k], onChange: set(k), 'aria-invalid': errors[k] ? 'true' : undefined, 'aria-describedby': errors[k] ? `a-${k}-error` : undefined });

  return (
    <section className="panel auth" aria-labelledby="auth-title">
      <h2 id="auth-title">{isLogin ? 'Log in' : 'Create a student account'}</h2>
      <form onSubmit={submit} noValidate>
        {!isLogin && <Field id="a-name" label="Name" error={errors.name}><input {...bind('name')} autoComplete="name" /></Field>}
        <Field id="a-email" label="Email" error={errors.email}><input {...bind('email')} type="email" autoComplete="email" /></Field>
        <Field id="a-password" label="Password" error={errors.password}>
          <input {...bind('password')} type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} />
        </Field>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
      </form>
      <p className="muted">
        {isLogin ? 'New student? ' : 'Already have an account? '}
        <button className="link-btn" type="button" onClick={switchMode}>{isLogin ? 'Create an account' : 'Log in'}</button>
      </p>
      {isLogin && <p className="muted">Workers and admins: use the login your admin gave you.</p>}
    </section>
  );
}
