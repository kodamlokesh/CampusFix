import Filters from './Filters.jsx';
import ComplaintList from './ComplaintList.jsx';

export default function ReportsSection({ c, role, workers, title }) {
  return (
    <section className="reports" aria-labelledby="reports-title">
      <h2 id="reports-title">{title}</h2>
      <Filters filters={c.filters} onChange={c.setFilters} onClear={c.resetFilters} hasFilters={c.hasFilters} workers={workers} />
      {c.loadError && (
        <div className="banner" role="alert">
          <span>{c.loadError}</span>
          <button className="btn btn-ghost" onClick={c.reload}>Try again</button>
        </div>
      )}
      <ComplaintList
        complaints={c.complaints}
        loading={c.loading}
        hasFilters={c.hasFilters}
        role={role}
        workers={workers}
        busyId={c.busyId}
        onClear={c.resetFilters}
        onStatusChange={c.changeStatus}
        onAssign={c.assign}
        onDelete={c.remove}
      />
    </section>
  );
}
