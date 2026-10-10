import useComplaints from '../hooks/useComplaints.js';
import Dashboard from '../components/Dashboard.jsx';
import ReportsSection from '../components/ReportsSection.jsx';

export default function WorkerPage({ toast }) {
  const c = useComplaints(toast);
  return (
    <>
      <Dashboard stats={c.stats} labels={{ one: 'report assigned to you', many: 'reports assigned to you' }} emptyText="Nothing is assigned to you yet. The admin will assign reports to you." />
      <ReportsSection c={c} role="worker" title="Your assigned reports" />
    </>
  );
}
