import useComplaints from '../hooks/useComplaints.js';
import Dashboard from '../components/Dashboard.jsx';
import ComplaintForm from '../components/ComplaintForm.jsx';
import ReportsSection from '../components/ReportsSection.jsx';

export default function StudentPage({ toast }) {
  const c = useComplaints(toast);
  return (
    <>
      <Dashboard stats={c.stats} labels={{ one: 'report from you', many: 'reports from you' }} emptyText="You haven't reported anything yet. Use the form to report a problem." />
      <div className="workspace">
        <ComplaintForm onCreate={c.create} />
        <ReportsSection c={c} role="student" title="Your reports" />
      </div>
    </>
  );
}
