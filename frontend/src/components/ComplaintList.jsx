import { useState } from 'react';
import { STATUSES, slug, timeAgo } from '../constants.js';

const EMPTY_TEXT = {
  student: 'No reports yet. Use the form to report the first problem.',
  worker: 'Nothing is assigned to you yet.',
  admin: 'No reports yet.',
};

function Item({ c, role, workers = [], busy, onStatusChange, onAssign, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const canDelete = role === 'admin' || (role === 'student' && c.status === 'Pending');
  const canSetStatus = role === 'admin' || role === 'worker';
  // Workers whose specialty matches the category come first
  const ordered = [...workers].sort((a, b) => (b.specialty === c.category) - (a.specialty === c.category));

  return (
    <li className={`report prio-${slug(c.priority)}${busy ? ' is-busy' : ''}`}>
      <div className="report-head">
        <h3>{c.title}</h3>
        <span className={`badge status-${slug(c.status)}`}>{c.status}</span>
      </div>
      <p className="report-desc">{c.description}</p>
      <dl className="meta">
        <div><dt>Category</dt><dd>{c.category}</dd></div>
        <div><dt>Location</dt><dd>{c.location}</dd></div>
        <div><dt>Priority</dt><dd>{c.priority}</dd></div>
        <div><dt>Reported</dt><dd title={new Date(c.createdAt).toLocaleString()}>{timeAgo(c.createdAt)}</dd></div>
        {role !== 'student' && <div><dt>Student</dt><dd>{c.student?.name || 'Unknown'}</dd></div>}
        {role !== 'worker' && <div><dt>Assigned to</dt><dd>{c.assignedTo?.name || 'Not assigned yet'}</dd></div>}
      </dl>

      {(canSetStatus || canDelete) && (
        <div className="actions">
          <div className="controls">
            {role === 'admin' && (
              <label className="status-pick">
                Worker
                <select value={c.assignedTo?._id || ''} disabled={busy} onChange={(e) => onAssign(c._id, e.target.value)}>
                  <option value="">Unassigned</option>
                  {ordered.map((w) => <option key={w._id} value={w._id}>{`${w.name} (${w.specialty})`}</option>)}
                </select>
              </label>
            )}
            {canSetStatus && (
              <label className="status-pick">
                Status
                <select value={c.status} disabled={busy} onChange={(e) => onStatusChange(c._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} disabled={role === 'worker' && s === 'Pending'}>{s}</option>)}
                </select>
              </label>
            )}
          </div>
          {canDelete && (confirming ? (
            <span className="confirm">
              Delete this report?
              <button className="btn btn-danger" disabled={busy} onClick={() => onDelete(c._id)}>Delete report</button>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Keep</button>
            </span>
          ) : (
            <button className="btn btn-ghost" disabled={busy} onClick={() => setConfirming(true)}>Delete</button>
          ))}
        </div>
      )}
    </li>
  );
}

export default function ComplaintList({ complaints, loading, hasFilters, role, workers, busyId, onClear, onStatusChange, onAssign, onDelete }) {
  if (loading) return <div className="list-skeleton" aria-busy="true" aria-label="Loading reports"><span /><span /><span /></div>;
  if (!complaints.length) {
    return (
      <div className="empty">
        {hasFilters ? (
          <>
            <p>No reports match these filters.</p>
            <button className="btn btn-ghost" onClick={onClear}>Clear filters</button>
          </>
        ) : (
          <p>{EMPTY_TEXT[role]}</p>
        )}
      </div>
    );
  }
  return (
    <ul className="report-list">
      {complaints.map((c) => (
        <Item key={c._id} c={c} role={role} workers={workers} busy={busyId === c._id}
          onStatusChange={onStatusChange} onAssign={onAssign} onDelete={onDelete} />
      ))}
    </ul>
  );
}
