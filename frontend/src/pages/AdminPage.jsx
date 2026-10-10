import { useCallback, useEffect, useState } from 'react';
import { createWorker, deleteWorker, listStudents, listWorkers } from '../api.js';
import useComplaints from '../hooks/useComplaints.js';
import Dashboard from '../components/Dashboard.jsx';
import ReportsSection from '../components/ReportsSection.jsx';
import PeoplePanel from '../components/PeoplePanel.jsx';

export default function AdminPage({ toast }) {
  const c = useComplaints(toast);
  const [tab, setTab] = useState('reports');
  const [workers, setWorkers] = useState([]);
  const [students, setStudents] = useState([]);
  const [peopleError, setPeopleError] = useState('');

  const loadPeople = useCallback(async () => {
    try {
      const [w, s] = await Promise.all([listWorkers(), listStudents()]);
      setWorkers(w.workers);
      setStudents(s.students);
      setPeopleError('');
    } catch (err) {
      setPeopleError(err.message);
    }
  }, []);

  useEffect(() => { loadPeople(); }, [loadPeople, tab]); // refresh counts when switching tabs

  async function addWorker(payload) {
    await createWorker(payload); // the form shows errors
    toast('success', 'Worker added');
    await loadPeople();
  }

  async function removeWorker(id) {
    try {
      await deleteWorker(id);
      toast('success', 'Worker deleted');
      await Promise.all([loadPeople(), c.reload()]);
    } catch (err) {
      toast('error', err.message);
    }
  }

  return (
    <>
      <Dashboard stats={c.stats} labels={{ one: 'report', many: 'reports' }} emptyText="No reports yet. They will appear here as students submit them." />
      <div className="tabs" role="tablist">
        {[['reports', 'Reports'], ['people', 'Workers and students']].map(([id, label]) => (
          <button key={id} role="tab" className="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === 'reports' ? (
        <ReportsSection c={c} role="admin" workers={workers} title="All reports" />
      ) : (
        <PeoplePanel workers={workers} students={students} error={peopleError} onAddWorker={addWorker} onDeleteWorker={removeWorker} />
      )}
    </>
  );
}
