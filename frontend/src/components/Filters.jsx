import { CATEGORIES, PRIORITIES, STATUSES } from '../constants.js';

export default function Filters({ filters, onChange, onClear, hasFilters, workers }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const select = (key, label, options) => (
    <select aria-label={label} value={filters[key]} onChange={set(key)}>
      <option value="All">{`All ${label.toLowerCase()}`}</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="filters" role="search">
      <input type="search" aria-label="Search reports" placeholder="Search title, details, or location" value={filters.search} onChange={set('search')} />
      <div className="filter-row">
        {select('category', 'Categories', CATEGORIES)}
        {select('status', 'Statuses', STATUSES)}
        {select('priority', 'Priorities', PRIORITIES)}
        {workers && (
          <select aria-label="Worker" value={filters.assigned} onChange={set('assigned')}>
            <option value="All">All workers</option>
            <option value="unassigned">Unassigned</option>
            {workers.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        )}
        <select aria-label="Sort by" value={filters.sort} onChange={set('sort')}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Highest priority first</option>
        </select>
        {hasFilters && <button className="btn btn-ghost" onClick={onClear}>Clear filters</button>}
      </div>
    </div>
  );
}
