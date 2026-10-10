import { useCallback, useEffect, useRef, useState } from 'react';
import { createComplaint, deleteComplaint, getStats, listComplaints, updateComplaint } from '../api.js';

export const DEFAULT_FILTERS = { search: '', category: 'All', status: 'All', priority: 'All', assigned: 'All', sort: 'newest' };

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Shared by all three dashboards: the server scopes the data to the signed-in role.
export default function useComplaints(toast) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const requestId = useRef(0);

  const search = useDebounce(filters.search.trim(), 300);
  const { category, status, priority, assigned, sort } = filters;
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  const loadComplaints = useCallback(async () => {
    const id = ++requestId.current; // ignore out-of-order responses
    try {
      const data = await listComplaints({ search, category, status, priority, assigned, sort });
      if (id !== requestId.current) return;
      setComplaints(data.complaints);
      setLoadError('');
    } catch (err) {
      if (id === requestId.current) setLoadError(err.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [search, category, status, priority, assigned, sort]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getStats());
    } catch {
      /* the list request reports connection problems */
    }
  }, []);

  useEffect(() => { loadComplaints(); }, [loadComplaints]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const reload = () => Promise.all([loadComplaints(), loadStats()]);
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  async function create(payload) {
    await createComplaint(payload); // the form shows errors
    toast('success', 'Report sent');
    if (hasFilters) setFilters(DEFAULT_FILTERS); // show the new report instead of hiding it behind filters
    else loadComplaints();
    loadStats();
  }

  async function runOn(id, action, message) {
    setBusyId(id);
    try {
      await action();
      toast('success', message);
      await reload();
    } catch (err) {
      toast('error', err.message);
      if (err.status === 404) reload();
    } finally {
      setBusyId(null);
    }
  }

  return {
    filters, setFilters, resetFilters, hasFilters, complaints, stats, loading, loadError, busyId, reload, create,
    changeStatus: (id, next) => runOn(id, () => updateComplaint(id, { status: next }), `Status changed to ${next}`),
    assign: (id, workerId) => runOn(id, () => updateComplaint(id, { assignedTo: workerId || null }), workerId ? 'Worker assigned' : 'Worker removed'),
    remove: (id) => runOn(id, () => deleteComplaint(id), 'Report deleted'),
  };
}
