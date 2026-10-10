import { useCallback, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import StudentPage from './pages/StudentPage.jsx';
import WorkerPage from './pages/WorkerPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const PAGES = { student: StudentPage, worker: WorkerPage, admin: AdminPage };

export default function App() {
  const { user, loading, logout } = useAuth();
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const Page = user && PAGES[user.role];

  return (
    <>
      <header className="masthead">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">!</span>
          <h1>CampusFix</h1>
        </div>
        {user ? (
          <div className="who">
            <span>{user.name}</span>
            <span className="role-tag">{user.role}</span>
            <button className="btn btn-light" onClick={logout}>Log out</button>
          </div>
        ) : (
          <p>Report what's broken. Watch it get fixed.</p>
        )}
      </header>
      <div className="tape" aria-hidden="true" />

      <main className="layout">
        {loading ? <p className="muted">Loading…</p> : Page ? <Page key={user._id} toast={toast} /> : <AuthPage />}
      </main>

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>)}
      </div>
    </>
  );
}
