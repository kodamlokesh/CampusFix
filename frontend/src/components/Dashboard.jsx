import { CATEGORIES, PRIORITIES, STATUSES, slug } from '../constants.js';

export default function Dashboard({ stats, labels, emptyText }) {
  if (!stats) return <section className="dashboard dash-loading" aria-busy="true" aria-label="Loading statistics" />;
  const { total, byStatus, byCategory, byPriority, openHighPriority, resolutionRate, unassigned } = stats;

  return (
    <section className="dashboard" aria-label="Statistics">
      <div className="dash-col dash-status">
        <h2>{`${total} ${total === 1 ? labels.one : labels.many}`}</h2>
        <p className="muted">{total ? `${resolutionRate}% resolved` : emptyText}</p>
        <div className="status-bar" role="img" aria-label={STATUSES.map((s) => `${byStatus[s]} ${s}`).join(', ')}>
          {STATUSES.map((s) => byStatus[s] > 0 && (
            <span key={s} className={`seg status-${slug(s)}`} style={{ flexGrow: byStatus[s] }} />
          ))}
        </div>
        <ul className="legend">
          {STATUSES.map((s) => (
            <li key={s}>
              <span className={`dot status-${slug(s)}`} />
              <strong>{byStatus[s]}</strong> {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="dash-col">
        <h3>By category</h3>
        <ul className="bars">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <span>{c}</span>
              <span className="track"><span className="fill" style={{ width: total ? `${(byCategory[c] / total) * 100}%` : 0 }} /></span>
              <strong>{byCategory[c]}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="dash-col">
        <h3>By priority</h3>
        <ul className="bars">
          {[...PRIORITIES].reverse().map((p) => (
            <li key={p}>
              <span>{p}</span>
              <span className="track"><span className={`fill prio-${slug(p)}`} style={{ width: total ? `${(byPriority[p] / total) * 100}%` : 0 }} /></span>
              <strong>{byPriority[p]}</strong>
            </li>
          ))}
        </ul>
        {unassigned > 0 && <p className="alert-note">{unassigned} open {unassigned === 1 ? 'report has' : 'reports have'} no worker</p>}
        <p className={openHighPriority ? 'alert-note' : 'muted'}>
          {openHighPriority ? `${openHighPriority} high-priority ${openHighPriority === 1 ? 'report is' : 'reports are'} still open` : 'No open high-priority reports'}
        </p>
      </div>
    </section>
  );
}
